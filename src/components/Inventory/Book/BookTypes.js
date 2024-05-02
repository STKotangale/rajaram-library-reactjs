/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookTypes = () => {
    //get
    const [bookTypes, setBookTypes] = useState([]);
    //add
    const [showAddBookTypeModal, setShowAddBookTypeModal] = useState(false);
    const [newBookTypeName, setNewBookTypeName] = useState('');
    //edit
    const [showEditBookTypeModal, setShowEditBookTypeModal] = useState(false);
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    //edit and delete
    const [selectedBookTypeId, setSelectedBookTypeId] = useState(null);
    //view 
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewBookType, setViewBookType] = useState(null);
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    //get api
    const fetchBookTypes = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/book-types`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching book types: ${response.statusText}`);
            }
            const data = await response.json();
            setBookTypes(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching book types. Please try again later.');
        }
    };

    useEffect(() => {
        fetchBookTypes();
    }, []);

    //reset fields
    const resetFormFields = () => {
        setNewBookTypeName('');
    };

    //add or post api
    const addBookType = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/auth/book-types`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookTypeName: newBookTypeName }),
            });
            if (!response.ok) {
                throw new Error(`Error adding book type: ${response.statusText}`);
            }
            const newBookType = await response.json();
            setBookTypes([...bookTypes, newBookType.data]);
            toast.success('Book type added successfully.');
            setShowAddBookTypeModal(false);
            resetFormFields();
        } catch (error) {
            console.error(error);
            toast.error('Error adding book type. Please try again later.');
        }
    };

    //edit api
    const editBookType = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/auth/book-types/${selectedBookTypeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookTypeName: newBookTypeName }),
            });
            if (!response.ok) {
                throw new Error(`Error editing book type: ${response.statusText}`);
            }
            const updatedBookTypeData = await response.json();
            const updatedBookTypes = bookTypes.map(bookType => {
                if (bookType.id === selectedBookTypeId) {
                    return { ...bookType, bookTypeName: updatedBookTypeData.data.bookTypeName, isBlock: updatedBookTypeData.data.isBlock };
                }
                return bookType;
            });
            setBookTypes(updatedBookTypes);
            setShowEditBookTypeModal(false);
            toast.success('Book type edited successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Error editing book type. Please try again later.');
        }
    };

    //delete api
    const deleteBookType = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/book-types/${selectedBookTypeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Error deleting book type: ${response.statusText}`);
            }
            setBookTypes(bookTypes.filter(bookType => bookType.id !== selectedBookTypeId));
            setShowDeleteConfirmation(false);
            toast.success('Book type deleted successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Error deleting book type. Please try again later.');
        }
    };



    //view function
    const handleShowViewModal = (bookType) => {
        setViewBookType(bookType);
        setShowViewModal(true);
    };

    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(bookTypes.length / itemsPerPage);
    const handlePageClick = (page) => setCurrentPage(page);

    const paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageClick(number)}>
            {number}
        </Pagination.Item>
    ));

    const indexOfLastPurchase = currentPage * itemsPerPage;
    const indexOfFirstPurchase = indexOfLastPurchase - itemsPerPage;
    const currentPurchases = bookTypes.slice(indexOfFirstPurchase, indexOfLastPurchase);

    return (
        <div className='padding-class'>
            <div className="main-content">
                <Container>
                    <div className='mt-3'>
                        <Button onClick={() => setShowAddBookTypeModal(true)} className="button-color">
                            Add Book Type
                        </Button>
                    </div>
                    <div className='mt-3'>

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    {/* <th>Book Type ID</th> */}
                                    <th>Book Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPurchases.map((bookType, index) => (
                                    <tr key={bookType.id}>
                                        <td>{indexOfFirstPurchase + index + 1}</td>
                                        {/* <td>{bookType.id}</td> */}
                                        <td>{bookType.bookTypeName}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                setSelectedBookTypeId(bookType.id);
                                                setNewBookTypeName(bookType.bookTypeName);
                                                setShowEditBookTypeModal(true);
                                            }} />

                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                                setSelectedBookTypeId(bookType.id);
                                                setShowDeleteConfirmation(true);
                                            }} />
                                            <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(bookType)} />

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {/* <div className='pagination-container'>
                        <Pagination className='pagination'>{paginationItems}</Pagination>
                    </div> */}
                    </div>


                    {/* Add Book Type Modal */}
                    <Modal show={showAddBookTypeModal} onHide={() => setShowAddBookTypeModal(false)} size="md">
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Book Type</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={addBookType}>
                                <Form.Group className="mb-3" controlId="newBookTypeName">
                                    <Form.Label>Book Type Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter book type"
                                        value={newBookTypeName}
                                        onChange={(e) => setNewBookTypeName(e.target.value)}
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

                    {/* Edit Book Type Modal */}
                    <Modal show={showEditBookTypeModal} onHide={() => {setShowEditBookTypeModal(false); resetFormFields()}}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Book Type</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={editBookType}>
                                <Form.Group className="mb-3" controlId="editedBookTypeName">
                                    <Form.Label>Book Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter edited book type "
                                        value={newBookTypeName}
                                        onChange={(e) => setNewBookTypeName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className='d-flex justify-content-end'>
                                    <Button className='button-color' type="submit">
                                        Update
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Delete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this book type?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={deleteBookType}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* view modal */}
                    <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>View Book Type </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label> Book Type</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={viewBookType ? viewBookType.bookTypeName : ''}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Row>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </Container>
            </div>
        </div>

    );
};

export default BookTypes;
