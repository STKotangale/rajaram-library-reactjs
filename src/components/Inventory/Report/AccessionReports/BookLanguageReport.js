/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../Auth/AuthProvider';
import '../CSS/Report.css';
import { Button, Container, Row, Form, Modal } from 'react-bootstrap';
import { Download, Printer } from 'react-bootstrap-icons';

const BookLanguageReport = () => {
    //get 
    const [bookLanguage, setBookLanguage] = useState([]);
    //post
    const [bookLangId, setBookLangId] = useState('');
    const [bookLangName, setBookLangName] = useState('');

    //pdf
    const [show, setShow] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    //auth
    const { username, accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchBookLanguages();
    }, [username, accessToken]);

    //get api
    const fetchBookLanguages = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/language/book-languages`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBookLanguage(data.data);
        } catch (error) {
            console.error('Error fetching book languages:', error);
            toast.error('Error fetching book languages. Please try again later.');
        }
    };

    //post
    const handleSubmit = async (event) => {
        event.preventDefault();
        setShow(true);
        setIsLoading(true);

        const payloadData = {
            bookLangId: bookLangId,
            bookLangName: bookLangName,
        };
        try {
            const response = await fetch(`${BaseURL}/api/reports/acession-status-languagewise`, {
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
                if (response.status === 500) {
                }
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

    const handleLanguageChange = (e) => {
        const selectedLanguageName = e.target.value;
        setBookLangName(selectedLanguageName);
        const selectedLanguage = bookLanguage.find(bookLanguage => bookLanguage.bookLangName === selectedLanguageName);
        if (selectedLanguage) {
            setBookLangId(selectedLanguage.bookLangId);
        } else {
            setBookLangId('');
        }
    };

    return (
        <div className='member-report'>
            <div className="overlay">
                <div className="centered-form">
                    <Container>
                        <div className="form-header">
                            <h2 className="text-primary">Book Language Wise Report</h2>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mt-5">
                                <Form.Group className="mb-3" controlId="publicationName">
                                    <Form.Label>Book Language</Form.Label>
                                    <input
                                        list="language"
                                        className="form-control"
                                        placeholder="Select or search language"
                                        value={bookLangName}
                                        onChange={handleLanguageChange}
                                        required
                                    />
                                    <datalist id="language">
                                    {bookLanguage.map(bookLanguage => (
                                            <option key={bookLanguage.bookLangId} value={bookLanguage.bookLangName}></option>
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
                    <Modal.Title className="flex-grow-1">Accession Status Report Book Language Wise</Modal.Title>
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

export default BookLanguageReport;
