import React, { useEffect, useState } from 'react';
import { Container, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../../Auth/AuthProvider';
import { Download, Printer } from 'react-bootstrap-icons';
import '../CSS/Report.css';

// Utility function to format date to yyyy-mm-dd
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};

const PurchaseReturnLedgerWiseRegister = () => {
    const [searchQuery] = useState('');
    const [ledgerName, setLedgerName] = useState([]);
    const [selectedLedgerName, setSelectedLedgerName] = useState("");
    const [selectedLedgerID, setSelectedLedgerID] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    //get  purchaser/ledger name
    useEffect(() => {
        const fetchLedgerNames = async () => {
            try {
                const response = await fetch(`${BaseURL}/api/ledger`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ledger names - ${response.status}`);
                }
                const data = await response.json();
                setLedgerName(data.data);
            } catch (error) {
                console.error('Error fetching ledger names:', error.message);
                toast.error('Error fetching ledger names. Please try again later.');
            }
        };
        fetchLedgerNames();
    }, [accessToken]);

    const handleLedgerChange = (event) => {
        const name = event.target.value;
        setSelectedLedgerName(name);
        const ledger = ledgerName.find(l => l.ledgerName === name);
        if (ledger) {
            setSelectedLedgerID(ledger.ledgerID);
        } else {
            setSelectedLedgerID('');
        }
    };

    const filteredLedgerName = ledgerName.filter(ledger =>
        ledger.ledgerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (!selectedLedgerName.trim()) {
                throw new Error('Please select purchaser name.');
            }

            const reportData = {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                selectedLedgerID: selectedLedgerID,
                selectedLedgerName:selectedLedgerName
                
            };


            setShowModal(true);
            setIsLoading(true);

            const response = await fetch(`${BaseURL}/api/reports/purchaseReturnRegisterLedgerWiseDateWise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(reportData)
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } else {
                const errorText = await response.text();
                toast.error(`Failed to submit report: ${errorText}`);
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
        link.download = 'issue-register-report.pdf';
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
                            <h2>Purchaser Return Register</h2>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>From Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
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
                                        required
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Purchaser Name</Form.Label>
                                    <Form.Control
                                        as="input"
                                        className="small-input"

                                        list="ledgerNames"
                                        value={selectedLedgerName}
                                        onChange={handleLedgerChange}
                                        required
                                        placeholder="Search or select purchaser name"
                                    />
                                    <datalist id="ledgerNames">
                                        {filteredLedgerName.map((ledger) => (
                                            <option key={ledger.ledgerId} value={ledger.ledgerName} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Row>

                            <div className='d-flex justify-content-end'>
                                <Button className='button-color' type="submit" disabled={isLoading}>
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Container>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="flex-grow-1">Purchase Return Register Purchser Wise Date Wise</Modal.Title>
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

export default PurchaseReturnLedgerWiseRegister;
