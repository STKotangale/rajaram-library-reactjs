/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../Auth/AuthProvider';
import '../CSS/Report.css';
import { Button, Container, Row, Form, Modal } from 'react-bootstrap';
import { Download, Printer } from 'react-bootstrap-icons';

const BookPublicationWiseReport = () => {
    //get publication name
    const [publications, setPublications] = useState([]);
    //post publicationId
    const [publicationName, setPublicationName] = useState('');
    const [publicationId, setPublicationId] = useState('');
    //pdf
    const [show, setShow] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    //auth
    const { username, accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchPublications();
    }, [username, accessToken]);

    //get api
    const fetchPublications = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-publications`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching publications: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedPublications = data.data.sort((a, b) => a.publicationName.localeCompare(b.publicationName));
            setPublications(sortedPublications);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching publications. Please try again later.');
        }
    };

    //post
    const handleSubmit = async (event) => {
        event.preventDefault();
        setShow(true);
        setIsLoading(true);

        const payloadData = {
            publicationId: publicationId,
            publicationName: publicationName,
        };
        try {
            const response = await fetch(`${BaseURL}/api/reports/acession-status-publicationwise`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                },
                body: JSON.stringify(payloadData)  
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
            } else {
                throw new Error(`Failed to fetch PDF: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setBlobUrl(null);
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setShow(false);
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
        }
    };

    const handleDownloadPDF = () => {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'acession-status-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const printWindow = window.open(blobUrl, '_blank', 'top=0,left=0,height=100%,width=auto');
        printWindow.focus();
        printWindow.print();
    };

    const handlePublicationChange = (e) => {
        const selectedPublicationName = e.target.value;
        setPublicationName(selectedPublicationName);
        const selectedPublication = publications.find(publication => publication.publicationName === selectedPublicationName);
        if (selectedPublication) {
            setPublicationId(selectedPublication.publicationId);
        } else {
            setPublicationId('');
        }
    };

    return (
        <div className='member-report'>
            <div className="overlay">
                <div className="centered-form">
                    <Container>
                        <div className="form-header">
                            <h2 className="text-primary">Accession Publication Wise Report</h2>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mt-5">
                                <Form.Group className="mb-3" controlId="publicationName">
                                    <Form.Label>Book Publication</Form.Label>
                                    <input
                                        list="publications"
                                        className="form-control"
                                        placeholder="Select or search publication"
                                        value={publicationName}
                                        onChange={handlePublicationChange}
                                        required
                                    />
                                    <datalist id="publications">
                                        {publications.map(publication => (
                                            <option key={publication.publicationId} value={publication.publicationName}></option>
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Row>
                            <div className='mt-4 d-flex justify-content-end'>
                                <Button className='button-color' type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Container>
                </div>
            </div>

            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="flex-grow-1">Accession Publication Wise Report</Modal.Title>
                    <Button variant="info" onClick={handleDownloadPDF} className="me-2">
                        <Download /> Download PDF
                    </Button>
                    <Button variant="primary" onClick={handlePrint} className="me-2">
                        <Printer /> Print
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p>Loading PDF... Please wait.</p>
                    ) : (
                        blobUrl ? (
                            <embed src={blobUrl} type="application/pdf" width="100%" height="500px" />
                        ) : (
                            <p>Error loading PDF. Please try again or contact support.</p>
                        )
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BookPublicationWiseReport;
