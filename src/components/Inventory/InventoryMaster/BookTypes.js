/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BookTypes = () => {

    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");

    useEffect(() => {
        setFiltered(bookTypes.filter(member =>
            member.bookTypeName.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [dataQuery]);

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

    useEffect(() => {
        fetchBookTypes();
    }, []);

    //get api
    const fetchBookTypes = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/booktype/book-types`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching book types: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.data.sort((a, b) => a.bookTypeName.localeCompare(b.bookTypeName));
            setBookTypes(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching book types. Please try again later.');
        }
    };

 
    //reset fields
    const resetFormFields = () => {
        setNewBookTypeName('');
    };

    //add or post api
    const addBookType = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/booktype/book-types`, {
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
            fetchBookTypes();
        } catch (error) {
            console.error(error);
            toast.error('Error adding book type. Please try again later.');
        }
    };


    const editBookType = async (e) => {
        e.preventDefault();
        try {
            // Check if selectedBookTypeId is undefined
            if (!selectedBookTypeId) {
                throw new Error("Selected book type ID is undefined.");
            }

            const response = await fetch(`${BaseURL}/api/booktype/book-types/${selectedBookTypeId}`, {
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
                if (bookType.bookTypeId === selectedBookTypeId) {
                    return { ...bookType, bookTypeName: updatedBookTypeData.data.bookTypeName };
                }
                return bookType;
            });

            setBookTypes(updatedBookTypes);
            toast.success('Book type edited successfully.');
            setShowEditBookTypeModal(false);
            resetFormFields();
            fetchBookTypes();
        } catch (error) {
            console.error(error);
            toast.error('Error editing book type. Please try again later.');
        }
    };

    const handleEditClick = (bookType) => {
        // Check if bookType is valid
        if (!bookType || !bookType.bookTypeId) {
            console.error("Invalid book type.");
            return;
        }
        setSelectedBookTypeId(bookType.bookTypeId);
        setNewBookTypeName(bookType.bookTypeName);
        setShowEditBookTypeModal(true);
    };


    const deleteBookType = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/booktype/book-types/${selectedBookTypeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409 && responseData.message) {
                    throw new Error(responseData.message);
                }
                throw new Error(`Error deleting book type: ${response.statusText}`);
            }
            setBookTypes(bookTypes.filter(bookType => bookType.bookTypeId !== selectedBookTypeId));
            setShowDeleteConfirmation(false);
            toast.success('Book type deleted successfully.');
            fetchBookTypes();
        } catch (error) {
            toast.error(error.message || 'Error deleting book type. Please try again later.');
        }
    };
    

    //view function
    const handleShowViewModal = (bookType) => {
        setViewBookType(bookType);
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

    // First and last page navigation functions
    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    const indexOfLastBookType = currentPage * perPage;
    const indexOfFirstBookType = indexOfLastBookType - perPage;
    const currentBookTypes = filtered.slice(indexOfFirstBookType, indexOfLastBookType);


    return (
        <div className='padding-class'>
            <div className="main-content">
                <Container className='small-screen-table'>
                    <div>
                        <div className='mt-3 d-flex justify-content-between'>
                            <Button onClick={() => setShowAddBookTypeModal(true)} className="button-color">
                                Add Book Type
                            </Button>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by Book Type"
                                    value={dataQuery}
                                    onChange={(e) => setDataQuery(e.target.value)}
                                    className="me-2 border border-success"
                                />
                            </div>
                        </div>

                        <div className='table-responsive mt-3 table-height'>
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
                                    {currentBookTypes.map((bookType, index) => (
                                        <tr key={bookType.bookTypeId}>
                                            <td>{indexOfFirstBookType + index + 1}</td>
                                            {/* <td>{bookType.id}</td> */}
                                            <td>{bookType.bookTypeName}</td>
                                            <td>
                                                <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                    // setSelectedBookTypeId(bookType.bookTypeId);
                                                    // setNewBookTypeName(bookType.bookTypeName);
                                                    // setShowEditBookTypeModal(true);
                                                    handleEditClick(bookType)

                                                }} />

                                                <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                                    setSelectedBookTypeId(bookType.bookTypeId);
                                                    setShowDeleteConfirmation(true);
                                                }} />
                                                <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(bookType)} />

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        <div className="pagination-container">
                            <Button onClick={handleFirstPage} disabled={currentPage === 1}>First Page</Button>
                            <Button onClick={handlePrevPage} disabled={currentPage === 1}> <ChevronLeft /></Button>
                            <div className="pagination-text">Page {currentPage} of {totalPages}</div>
                            <Button onClick={handleNextPage} disabled={currentPage === totalPages}> <ChevronRight /></Button>
                            <Button onClick={handleLastPage} disabled={currentPage === totalPages}>Last Page</Button>
                        </div>

                    </div>


                    {/* Add Book Type Modal */}
                    <Modal show={showAddBookTypeModal} onHide={() => { setShowAddBookTypeModal(false); resetFormFields() }} size="md">
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
                    <Modal show={showEditBookTypeModal} onHide={() => { setShowEditBookTypeModal(false); resetFormFields() }}>
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
