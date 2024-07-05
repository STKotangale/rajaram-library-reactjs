/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { Container, Table, Pagination, Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

const BookLanguages = () => {
    //search
    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");
    useEffect(() => {
        setFiltered(bookLanguages.filter(member =>
            member.bookLangName.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [dataQuery]);
    //get all book lang
    const [bookLanguages, setBookLanguages] = useState([]);
    //add new book lang
    const [addBookLangName, setAddBookLangName] = useState('');
    const [showAddLanguage, setShowAddLanguage] = useState(false);
    //edit lang
    const [showEditModal, setShowEditModal] = useState(false);
    const [editableLanguage, setEditableLanguage] = useState({ bookLangName: '' });
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedLanguageId, setSelectedLanguageId] = useState(null);
    //view 
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLanguage, setViewLanguage] = useState(null);
    //auth
    const { username, accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;


    useEffect(() => {
        fetchBookLanguages();
    }, [username, accessToken]);

    // get book languages
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
            const sortedData = data.data.sort((a, b) => a.bookLangName.localeCompare(b.bookLangName));
            setBookLanguages(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error('Error fetching book languages:', error);
        }
    };

    //reset fields
    const resetFormFields = () => {
        setAddBookLangName('');
    };

    //add  or post api
    const addLanguage = async (event) => {
        event.preventDefault();
        const payload = {
            bookLangName: addBookLangName,
        };
        try {
            const response = await fetch(`${BaseURL}/api/language/book-languages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409) {
                    toast.info(`Cannot add language: ${responseData.message}`);
                    return;
                }
                throw new Error(`Error adding language: ${responseData.message || response.statusText}`);
            }
            setBookLanguages([...bookLanguages, responseData.data]);
            toast.success('Book language added successfully.');
            setShowAddLanguage(false);
            resetFormFields();
            fetchBookLanguages();
        } catch (error) {
            toast.error('Error adding book language. Please try again later.');
        }
    };

    //edit function
    // Function to handle clicking the edit icon
    const handleShowEditModal = (language) => {
        setEditableLanguage({
            bookLangId: language.bookLangId,
            bookLangName: language.bookLangName,
        });
        setShowEditModal(true);
    };

    //edit function
    const handleEditLanguageChange = (e) => {
        setEditableLanguage({ ...editableLanguage, bookLangName: e.target.value });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    // edit api
    const handleEditLanguageSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/language/book-languages/${editableLanguage.bookLangId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookLangName: editableLanguage.bookLangName })
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409) {
                    toast.info(`Cannot edit book: ${responseData.message}`);
                    return;
                }
                throw new Error(`Error editing book: ${responseData.message || response.statusText}`);
            }
            const updatedLanguages = bookLanguages.map(lang => lang.bookLangId === responseData.data.bookLangId ? responseData.data : lang);
            setBookLanguages(updatedLanguages);
            toast.success('Book language edited successfully.');
            setShowEditModal(false);
            fetchBookLanguages();
        } catch (error) {
            console.error('Error updating book language:', error);
            toast.error('Error editing book language. Please try again later.');
        }
    };

    //delete function
    const handleShowDeleteConfirmation = (languageId) => {
        setSelectedLanguageId(languageId);
        setShowDeleteConfirmation(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
        setSelectedLanguageId(null);
    };

    //delete api
    const handleDeleteLanguage = async (languageId) => {
        try {
            const response = await fetch(`${BaseURL}/api/language/book-languages/${languageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409 && responseData.message) {
                    throw new Error(responseData.message);
                }
                throw new Error(`Error deleting book type: ${response.statusText}`);
            }
            setBookLanguages(bookLanguages.filter(language => language.bookLangId !== languageId));
            toast.success('Book language delete successfully.');
            setShowDeleteConfirmation(false);
            fetchBookLanguages();
        } catch (error) {
            toast.info(error.message || 'Error delete book language. Please try again later.');
        }
    };

    //view function
    const handleShowViewModal = (language) => {
        setViewLanguage(language);
        setShowViewModal(true);
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
                <div className='mt-3 d-flex justify-content-between'>
                    <Button onClick={() => setShowAddLanguage(true)} className="button-color">
                        Add Book language
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search by Book Language"
                            value={dataQuery}
                            onChange={(e) => setDataQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                    </div>
                </div>
                <div className='mt-3'>
                    <div className="table-responsive table-height">
                        <Table striped bordered hover className='mt-3'>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Language</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((language, index) => (
                                    <tr key={language.bookLangId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{language.bookLangName}</td>
                                        <td>
                                            <PencilSquare
                                                className="ms-3 action-icon edit-icon"
                                                onClick={() => handleShowEditModal(language)}
                                            />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => handleShowDeleteConfirmation(language.bookLangId)} />
                                            <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(language)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
                <div className="pagination-container">
                    <Button onClick={handleFirstPage} disabled={currentPage === 1}>First Page</Button>
                    <Button onClick={handlePrevPage} disabled={currentPage === 1}> <ChevronLeft /></Button>
                    <div className="pagination-text">Page {currentPage} of {totalPages}</div>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages}> <ChevronRight /></Button>
                    <Button onClick={handleLastPage} disabled={currentPage === totalPages}>Last Page</Button>
                </div>

                {/* add book insert type */}
                <Modal show={showAddLanguage} onHide={() => { setShowAddLanguage(false); resetFormFields() }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Book Language</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addLanguage}>
                            <Form.Group className="mb-3" controlId="newLanguage">
                                <Form.Label>Book Language</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter book language"
                                    value={addBookLangName}
                                    onChange={(e) => setAddBookLangName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <div className='d-flex justify-content-end'>
                                <Button className='button-color' type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* edit modal */}
                <Modal show={showEditModal} onHide={() => { handleCloseEditModal(false); resetFormFields() }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Book Language</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditLanguageSubmit}>
                            <Form.Group className="mb-3" controlId="editLanguage">
                                <Form.Label>Book Language</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter book language name"
                                    value={editableLanguage.bookLangName}
                                    onChange={handleEditLanguageChange}
                                    required
                                />
                            </Form.Group>
                            <div className='d-flex justify-content-end'>
                                <Button type="submit" className="button-color">
                                    Update
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteConfirmation} onHide={handleCloseDeleteConfirmation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this book language?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteConfirmation}>
                            No
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteLanguage(selectedLanguageId)}>
                            Yes
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* view modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View Book Language</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Language Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewLanguage ? viewLanguage.bookLangName : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>

            </Container>
        </div >

    );
};

export default BookLanguages;
