/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../../Auth/AuthProvider';
import { Download, Printer } from 'react-bootstrap-icons';
import '../CSS/Report.css';

// Utility function to format date to dd-mm-yyyy
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};

const IssueFineRegisterMemberWise = () => {
    const [generalMembers, setGeneralMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchGeneralMembers();
    }, [accessToken]);

    const fetchGeneralMembers = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/general-members`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setGeneralMembers(data.data);
        } catch (error) {
            console.error("Failed to fetch general members:", error);
            toast.error('Failed to load general members. Please try again later.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let memberIdToSend = '';
        if (selectedMember) {
            const [firstName, middleName, lastName] = selectedMember.split(' ');
            const selectedMemberObject = generalMembers.find(member => 
                member.firstName === firstName &&
                member.middleName === middleName &&
                member.lastName === lastName
            );
            memberIdToSend = selectedMemberObject?.memberId || '';
        }
        const reportData = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            memberId: memberIdToSend,
            selectedMember: selectedMember,
        };
        setShowModal(true);
        setIsLoading(true);
        try {
            const response = await fetch(`${BaseURL}/api/reports/issueFineRegiMemberAndsterDateWise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(reportData),
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } else {
                toast.error('Failed to submit report');
                setPdfUrl(null);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error submitting report');
            setPdfUrl(null);
        }
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleDownloadPDF = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'issue-member-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const printWindow = window.open(pdfUrl, '_blank', 'top=0,left=0,height=100%,width=auto');
        printWindow.focus();
        printWindow.print();
    };

    return (
        <div className='member-report'>
            <div className="overlay">
                <div className="centered-form">
                    <Container>
                        <div className="form-header">
                            <h2>Issue Fine Member Wise Register</h2>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedMember}
                                        onChange={(e) => setSelectedMember(e.target.value)}
                                        list="memberNameList"
                                        placeholder="Enter or select a member"
                                    />
                                    <datalist id="memberNameList">
                                        {generalMembers.map(member => (
                                            <option key={member.memberId} value={`${member.firstName} ${member.middleName} ${member.lastName}`}>
                                                {`${member.firstName} ${member.middleName} ${member.lastName}`}
                                            </option>
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>From Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>To Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        min={startDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <div className='d-flex justify-content-end'>
                                <Button type="submit" className='button-color' disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </Button>
                            </div>
                        </Form>
                    </Container>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="flex-grow-1">Issue Fine Member Wise Report</Modal.Title>
                    <Button variant="info" onClick={handleDownloadPDF} className="me-2" disabled={!pdfUrl}>
                        <Download /> Download PDF
                    </Button>
                    <Button variant="primary" onClick={handlePrint} className="me-2" disabled={!pdfUrl}>
                        <Printer /> Print
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p>Loading PDF... Please wait.</p>
                    ) : pdfUrl ? (
                        <embed src={pdfUrl} type="application/pdf" width="100%" height="500px" />
                    ) : (
                        <p>Error loading PDF. Please try again or contact support.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleCloseModal}>Close</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default IssueFineRegisterMemberWise;
