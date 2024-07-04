/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Row, Col, Container } from 'react-bootstrap';
import { useAuth } from '../../Auth/AuthProvider';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, PencilSquare } from 'react-bootstrap-icons';
import '../InventoryTransaction/CSS/Purchase.css';

const BookDetailsTable = () => {
    //search
    const [filtered, setFiltered] = useState([]);
    const [bookNameQuery, setBookNameQuery] = useState("");
    const [accessionNoQuery, setAccessionNoQuery] = useState("");
    useEffect(() => {
        setFiltered(bookDetails.filter(member =>
            member.bookName.toLowerCase().includes(bookNameQuery.toLowerCase()) &&
            (accessionNoQuery ? (member.accessionNo && member.accessionNo.toLowerCase().includes(accessionNoQuery.toLowerCase())) : true)
        ));
        setCurrentPage(1);
    }, [bookNameQuery, accessionNoQuery]);

    //get book purchase
    const [bookDetails, setBookDetails] = useState([]);
    //update book details
    const [showUpdateBookDetails, setShowUpdateBookDetails] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    //auth
    const BaseURL = process.env.REACT_APP_BASE_URL;
    const { username, accessToken } = useAuth();

    //get all data api call
    useEffect(() => {
        fetchBookDetails();
    }, []);

    //get api- all purchase book details
    const fetchBookDetails = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/bookdetails`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch book details');
            }
            const data = await response.json();
            setBookDetails(data);
            setFiltered(data);
        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    };

    //update function
    const handleUpdate = (book) => {
        setSelectedBook(book);
        setShowUpdateBookDetails(true);
    };

    //update api
    const updateBookDetails = async (e) => {
        e.preventDefault();
        try {
            if (!selectedBook) {
                throw new Error('No book selected');
            }
            const updatedBookDetails = {
                isbn: selectedBook.isbn,
                classificationNumber: selectedBook.classificationNumber,
                itemNumber: selectedBook.itemNumber,
                editor: selectedBook.editor,
                title: selectedBook.title,
                secondTitle: selectedBook.secondTitle,
                seriesTitle: selectedBook.seriesTitle,
                edition: selectedBook.edition,
                publicationYear: selectedBook.publicationYear,
                numberOfPages: selectedBook.numberOfPages,
                subjectHeading: selectedBook.subjectHeading,
                secondAuthorEditor: selectedBook.secondAuthorEditor,
                thirdAuthorEditor: selectedBook.thirdAuthorEditor,
                itemType: selectedBook.itemType,
                permanentLocation: selectedBook.permanentLocation,
                currentLocation: selectedBook.currentLocation,
                shelvingLocation: selectedBook.shelvingLocation,
                volumeNo: selectedBook.volumeNo,
                fullCallNumber: selectedBook.fullCallNumber,
                purchaseCopyNo: selectedBook.purchaseCopyNo,
                accessionNo: selectedBook.accessionNo,
                copyNo: selectedBook.copyNo
            };
            const response = await fetch(`${BaseURL}/api/bookdetails/update/book-details/${selectedBook.bookDetailId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedBookDetails),
            });
            if (!response.ok) {
                throw new Error('Failed to update book details');
            }
            await response.json();
            toast.success('Book details updated successfully.');
            setShowUpdateBookDetails(false);
            fetchBookDetails();
        } catch (error) {
            console.error('Error updating book details:', error);
            toast.error('Error updating book details. Please try again later.');
        }
    };

    //pagination function
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(filtered.length / perPage);
    const handleNextPage = () => {
        setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    };
    const handlePrevPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    };
    const handleFirstPage = () => {
        setCurrentPage(1);
    };
    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };
    const indexOfLastBookType = currentPage * perPage;
    const indexOfNumber = indexOfLastBookType - perPage;
    const currentData = filtered.slice(indexOfNumber, indexOfLastBookType);

    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-3 table-container-general-member-1'>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search by Book Name"
                            value={bookNameQuery}
                            onChange={(e) => setBookNameQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Search by Accession  No"
                            value={accessionNoQuery}
                            onChange={(e) => setAccessionNoQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                    </div>
                    <div className="table-responsive table-height-book-details mt-4">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sr.No.</th>
                                    <th>Book Name</th>
                                    <th>Accession No</th>
                                    <th>Purchase Copy No</th>
                                    <th>Rate</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((book, index) => (
                                    <tr key={book.bookDetailId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{book.bookName}</td>
                                        <td>{book.accessionNo}</td>
                                        <td>{book.purchaseCopyNo}</td>
                                        <td>{book.book_rate}</td>
                                        <td>{book.status === 1 ? 'Updated' : 'Not Updated'}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => handleUpdate(book)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="pagination-container mt-2">
                        <Button onClick={handleFirstPage} disabled={currentPage === 1}>First</Button>
                        <Button onClick={handlePrevPage} disabled={currentPage === 1}> <ChevronLeft /></Button>
                        <div className="pagination-text">Page {currentPage} of {totalPages}</div>
                        <Button onClick={handleNextPage} disabled={currentPage === totalPages}> <ChevronRight /></Button>
                        <Button onClick={handleLastPage} disabled={currentPage === totalPages}>Last</Button>
                    </div>
                </div>

                {/* Update Book Details Modal */}
                <Modal show={showUpdateBookDetails} onHide={() => setShowUpdateBookDetails(false)} size='xl'>
                    <div className='bg-light'>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Book Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='box'>
                            <Form onSubmit={updateBookDetails}>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="isbn">
                                        <Form.Label>ISBN</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter ISBN"
                                            value={selectedBook?.isbn || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, isbn: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="copyNo">
                                        <Form.Label>Purchase Copy No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Purchase Copy No"
                                            className="text-end text-right-placeholder"
                                            value={selectedBook?.purchaseCopyNo || ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="itemType">
                                        <Form.Label>Item Type</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Item Type"
                                            value={selectedBook?.itemType || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, itemType: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="editor">
                                        <Form.Label>Editor</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Editor"
                                            value={selectedBook?.editor || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, editor: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="secondAuthorEditor">
                                        <Form.Label>Second Author/Editor</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Second Author/Editor"
                                            value={selectedBook?.secondAuthorEditor || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, secondAuthorEditor: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="thirdAuthorEditor">
                                        <Form.Label>Third Author/Editor</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Third Author/Editor"
                                            value={selectedBook?.thirdAuthorEditor || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, thirdAuthorEditor: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">

                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="publicationYear">
                                        <Form.Label>Publication Year</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Publication Year"
                                            className="text-end text-right-placeholder"
                                            value={selectedBook?.publicationYear || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, publicationYear: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="title">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Title"
                                            value={selectedBook?.title || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="secondTitle">
                                        <Form.Label>Second Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Second Title"
                                            value={selectedBook?.secondTitle || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, secondTitle: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="seriesTitle">
                                        <Form.Label>Series Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Series Title"
                                            value={selectedBook?.seriesTitle || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, seriesTitle: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="subjectHeading">
                                        <Form.Label>Subject Heading</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Subject Heading"
                                            value={selectedBook?.subjectHeading || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, subjectHeading: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="edition">
                                        <Form.Label>Edition</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Edition"
                                            className="text-end text-right-placeholder"
                                            value={selectedBook?.edition || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, edition: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="numberOfPages">
                                        <Form.Label>Number of Pages</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Number of Pages"
                                            className="text-end text-right-placeholder"
                                            value={selectedBook?.numberOfPages || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, numberOfPages: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="classificationNumber">
                                        <Form.Label>Classification Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Classification Number"
                                            value={selectedBook?.classificationNumber || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, classificationNumber: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="permanentLocation">
                                        <Form.Label>Permanent Location</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Permanent Location"
                                            value={selectedBook?.permanentLocation || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, permanentLocation: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="currentLocation">
                                        <Form.Label>Current Location</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Current Location"
                                            value={selectedBook?.currentLocation || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, currentLocation: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="shelvingLocation">
                                        <Form.Label>Shelving Location</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Shelving Location"
                                            value={selectedBook?.shelvingLocation || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, shelvingLocation: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="volumeNo">
                                        <Form.Label>Volume Number </Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter Volume Number"
                                            className="text-end text-right-placeholder"
                                            value={selectedBook?.volumeNo || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, volumeNo: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="fullCallNumber">
                                        <Form.Label>Full Call Number </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Full Call Number"
                                            value={selectedBook?.fullCallNumber || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, fullCallNumber: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="accessionNo">
                                        <Form.Label>Accession Number </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Accession Number"
                                            value={selectedBook?.accessionNo || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, accessionNo: e.target.value })}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="itemNumber">
                                        <Form.Label>Item Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Item Number"
                                            value={selectedBook?.itemNumber || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, itemNumber: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group className="mb-3" lg={4} as={Col} controlId="copyNo">
                                        <Form.Label>Copy No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Copy No"
                                            value={selectedBook?.copyNo || ''}
                                            onChange={(e) => setSelectedBook({ ...selectedBook, copyNo: e.target.value })}
                                        />
                                    </Form.Group>
                                </Row>

                                <div className='d-flex justify-content-end'>
                                    <Button className='button-color' type="submit">Submit</Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </div>
                </Modal>

            </Container>
        </div>
    );
};

export default BookDetailsTable;






