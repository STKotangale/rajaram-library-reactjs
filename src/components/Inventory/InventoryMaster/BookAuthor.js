/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookAuthor = () => {
    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");

    useEffect(() => {
        setFiltered(bookAuthors.filter(member =>
            member.authorName.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1); 
    }, [dataQuery]);

    //get
    const [bookAuthors, setBookAuthors] = useState([]);
    //add
    const [showAddBookAuthorModal, setShowAddBookAuthorModal] = useState(false);
    const [newBookAuthor, setNewBookAuthor] = useState({
        authorName: '',
        address: '',
        contactNo1: '',
        contactNo2: '',
        emailId: ''
    });
    //edit
    const [showEditBookAuthorModal, setShowEditBookAuthorModal] = useState(false);
    // delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    //edit and delete
    const [selectedBookAuthorId, setSelectedBookAuthorId] = useState(null);
    // View modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAuthor, setViewAuthor] = useState(null);
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchBookAuthors();
    }, []);

    //get api
    const fetchBookAuthors = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-authors`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching book authors: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.data.sort((a, b) => a.authorName.localeCompare(b.authorName));
            setBookAuthors(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching book authors. Please try again later.');
        }
    };

    //reset field
    const resetFormFields = () => {
        setNewBookAuthor({
            authorName: '',
            address: '',
            contactNo1: '',
            contactNo2: '',
            emailId: ''
        });
    };
    //add or post api
    const addBookAuthor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/book-authors`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBookAuthor),
            });
            if (!response.ok) {
                throw new Error(`Error adding book author: ${response.statusText}`);
            }
            const newAuthor = await response.json();
            setBookAuthors([...bookAuthors, newAuthor.data]);
            setShowAddBookAuthorModal(false);
            toast.success('Book author added successfully.');
            resetFormFields();
            fetchBookAuthors();
        } catch (error) {
            console.error(error);
            toast.error('Error adding book author. Please try again later.');
        }
    };

    //edit api
    const editBookAuthor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/book-authors/${selectedBookAuthorId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBookAuthor),
            });
            if (!response.ok) {
                throw new Error(`Error editing book author: ${response.statusText}`);
            }
            const updatedAuthorData = await response.json();
            const updatedAuthors = bookAuthors.map(author => {
                if (author.id === selectedBookAuthorId) {
                    return updatedAuthorData.data;
                }
                return author;
            });
            setBookAuthors(updatedAuthors);
            setShowEditBookAuthorModal(false);
            setNewBookAuthor({
                authorName: '',
                address: '',
                contactNo1: '',
                contactNo2: '',
                emailId: ''
            });
            toast.success('Book author edited successfully.');
            fetchBookAuthors();

        } catch (error) {
            console.error(error);
            toast.error('Error editing book author. Please try again later.');
        }
    };

    //delete api
    const deleteBookAuthor = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-authors/${selectedBookAuthorId}`, {
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
            setBookAuthors(bookAuthors.filter(author => author.id !== selectedBookAuthorId));
            setShowDeleteConfirmation(false);
            toast.success('Book author deleted successfully.');
            fetchBookAuthors();

        } catch (error) {
            console.error(error);
            toast.error(error.message ||  'Error deleting book author. Please try again later.');
        }
    };

    // View modal
    const handleShowViewModal = (author) => {
        setViewAuthor(author);
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
    const indexOfNumber = indexOfLastBookType - perPage;
    const currentData = filtered.slice(indexOfNumber, indexOfLastBookType);


    return (
        <div className="main-content">

            <Container className='small-screen-table'>
            <div className='mt-3 d-flex justify-content-between'>
                    <Button onClick={() => setShowAddBookAuthorModal(true)} className="button-color">
                        Add Book Author
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search by Author Name"
                            value={dataQuery}
                            onChange={(e) => setDataQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                    </div>
                </div>

                <div className='mt-3'>
                    <div className="table-responsive table-height">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Author Name</th>
                                    <th>Address</th>
                                    <th>Contact No </th>
                                    <th>Email ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((author, index) => (
                                    <tr key={author.authorId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{author.authorName}</td>
                                        <td>{author.authorAddress}</td>
                                        <td>{author.authorContactNo1}</td>
                                        <td>{author.authorEmailId}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                setSelectedBookAuthorId(author.authorId);
                                                setNewBookAuthor({
                                                    authorName: author.authorName,
                                                    address: author.authorAddress,
                                                    contactNo1: author.authorContactNo1,
                                                    contactNo2: author.authorContactNo2,
                                                    emailId: author.authorEmailId
                                                });
                                                setShowEditBookAuthorModal(true);
                                            }} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                                setSelectedBookAuthorId(author.authorId);
                                                setShowDeleteConfirmation(true);
                                            }} />
                                            <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(author)} />
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


                {/* Add Book Author Modal */}
                <Modal show={showAddBookAuthorModal} onHide={() => {setShowAddBookAuthorModal(false); resetFormFields()}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Book Author</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addBookAuthor}>
                            <Form.Group className="mb-3" controlId="addBookAuthor">
                                <Form.Label className="required-indicator">Author Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Author name"
                                    value={newBookAuthor.authorName}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, authorName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="addBookAuthorAddress">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Address"
                                    value={newBookAuthor.address}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, address: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="addBookAuthorContact1">
                                <Form.Label>Contact No 1</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Contact number 1"
                                    value={newBookAuthor.contactNo1}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10 && /^\d*$/.test(value)) {
                                            setNewBookAuthor({ ...newBookAuthor, contactNo1: value })
                                        }
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="addBookAuthorContact2">
                                <Form.Label>Contact No 2</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Contact number 2"
                                    value={newBookAuthor.contactNo2}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10 && /^\d*$/.test(value)) {
                                            setNewBookAuthor({ ...newBookAuthor, contactNo2: value })
                                        }
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="addBookAuthorEmail">
                                <Form.Label>Email ID</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    value={newBookAuthor.emailId}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, emailId: e.target.value })}
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

                {/* Edit Book Author Modal */}
                <Modal show={showEditBookAuthorModal} onHide={() => { setShowEditBookAuthorModal(false); resetFormFields(); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Book Author</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editBookAuthor}>
                            <Form.Group className="mb-3" controlId="editBookAuthorName">
                                <Form.Label className="required-indicator">Author Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Author name"
                                    value={newBookAuthor.authorName}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, authorName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editBookAuthorAddress">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Address"
                                    value={newBookAuthor.address}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, address: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editBookAuthorContact1">
                                <Form.Label>Contact No 1</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Contact number 1"
                                    value={newBookAuthor.contactNo1}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10 && /^\d*$/.test(value)) {

                                            setNewBookAuthor({ ...newBookAuthor, contactNo1: value })
                                        }
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editBookAuthorContact2">
                                <Form.Label>Contact No 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Contact number"
                                    value={newBookAuthor.contactNo2}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10 && /^\d*$/.test(value)) {
                                            setNewBookAuthor({ ...newBookAuthor, contactNo2: value })
                                        }
                                    }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="editBookAuthoremailId">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Email"
                                    value={newBookAuthor.emailId}
                                    onChange={(e) => setNewBookAuthor({ ...newBookAuthor, emailId: e.target.value })}
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
                    <Modal.Body>Are you sure you want to delete this book author?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={deleteBookAuthor}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>


                {/* View Author Modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View Book Author</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group>
                                    <Form.Label>Author Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewAuthor ? viewAuthor.authorName : ''}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group >
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewAuthor ? viewAuthor.authorAddress : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group >
                                    <Form.Label>Contact No 1</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewAuthor ? viewAuthor.authorContactNo1 : ''}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group >
                                    <Form.Label>Contact No 2</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewAuthor ? viewAuthor.authorContactNo2 : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group >
                                    <Form.Label>Email ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewAuthor ? viewAuthor.authorEmailId : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>

            </Container>
        </div>
    );
};

export default BookAuthor;


