/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Books = () => {
    //get books
    const [books, setBooks] = useState([]);
    //add book
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [newBookName, setNewBookName] = useState('');
    //edit book
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    //edit and delete
    const [selectedBookId, setSelectedBookId] = useState(null);
    // View 
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewBook, setViewBook] = useState(null);
    //get book author
    const [authors, setAuthors] = useState([]);
    const [newBookAuthor, setNewBookAuthor] = useState('');
    //get book publication
    const [publications, setPublications] = useState([]);
    const [newBookPublication, setNewBookPublication] = useState('');
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;


    //get api
    const fetchBooks = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/book`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching books: ${response.statusText}`);
            }
            const data = await response.json();
            setBooks(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching books. Please try again later.');
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchAuthors();
        fetchPublications();
    }, []);


    // Reset form fields
    const resetFormFields = () => {
        setNewBookName('');
        setNewBookAuthor('');
        setNewBookPublication('');
    };

    // Handle add book form submission
    const addBook = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookName: newBookName,
                authorId: newBookAuthor,
                publicationId: newBookPublication
            }),
        };
        try {
            const response = await fetch(`${BaseURL}/api/auth/book`, requestOptions);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(`Error adding book: ${responseData.message || response.statusText}`);
            }
            setBooks(books => [...books, responseData.data]);
            toast.success('Book added successfully.');
            resetFormFields();
            setShowAddBookModal(false); 
        } catch (error) {
            console.error("Error during book addition:", error);
            toast.error('Error adding book. Please try again later.');
        }
    };


    // Edit api
    const editBook = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/auth/book/${selectedBookId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookName: newBookName,
                    authorId: newBookAuthor,
                    publicationId: newBookPublication
                }),
            });
            if (!response.ok) {
                throw new Error(`Error editing book: ${response.statusText}`);
            }
            const updatedBookData = await response.json();
            const updatedBooks = books.map(book => {
                if (book.bookId === selectedBookId) {
                    return { ...book, bookName: updatedBookData.data.bookName };
                }
                return book;
            });
            setBooks(updatedBooks);
            setShowEditBookModal(false);
            toast.success('Book edited successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Error editing book. Please try again later.');
        }
    };

    // Delete api
    const deleteBook = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/book/${selectedBookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Error deleting book: ${response.statusText}`);
            }
            setBooks(books.filter(book => book.bookId !== selectedBookId));
            setShowDeleteConfirmation(false);
            toast.success('Book deleted successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Error deleting book. Please try again later.');
        }
    };

    // View function
    const handleShowViewModal = (book) => {
        setViewBook(book);
        setShowViewModal(true);
    };


    // Fetch authors 
    const fetchAuthors = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-authors`);
            if (!response.ok) {
                throw new Error(`Error fetching authors: ${response.statusText}`);
            }
            const data = await response.json();
            setAuthors(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching authors. Please try again later.');
        }
    };

    // fetch publications
    const fetchPublications = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-publications`);
            if (!response.ok) {
                throw new Error(`Error fetching publications: ${response.statusText}`);
            }
            const data = await response.json();
            setPublications(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching publications. Please try again later.');
        }
    };

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(books.length / itemsPerPage);
    const handlePageClick = (page) => setCurrentPage(page);

    const paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageClick(number)}>
            {number}
        </Pagination.Item>
    ));

    const indexOfLastPurchase = currentPage * itemsPerPage;
    const indexOfFirstPurchase = indexOfLastPurchase - itemsPerPage;
    const currentPurchases = books.slice(indexOfFirstPurchase, indexOfLastPurchase);

    return (
        <div className="main-content">
            <Container>
                <div className='mt-3'>
                    <Button onClick={() => setShowAddBookModal(true)} className="button-color">
                        Add Book
                    </Button>
                </div>
                <div className='mt-3'>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Book</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPurchases.map((book, index) => (
                                <tr key={book.bookId}>
                                    <td>{indexOfFirstPurchase + index + 1}</td>
                                    <td>{book.bookName}</td>
                                    <td>
                                        <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                            setSelectedBookId(book.bookId);
                                            setNewBookName(book.bookName);
                                            setNewBookAuthor(book.author?.authorId);
                                            setNewBookPublication(book.publication?.publicationId)
                                            setShowEditBookModal(true);
                                        }} />
                                        <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                            setSelectedBookId(book.bookId);
                                            setShowDeleteConfirmation(true);
                                        }} />
                                        <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(book)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>{paginationItems}</Pagination>
                </div>

                {/* Add Book Modal */}
                <Modal show={showAddBookModal} onHide={() => setShowAddBookModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Book</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addBook}>
                            <Form.Group className="mb-3" controlId="newBookName">
                                <Form.Label>Book</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter book"
                                    value={newBookName}
                                    onChange={(e) => setNewBookName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newBookAuthor">
                                <Form.Label>Author</Form.Label>
                                <Form.Select
                                    value={newBookAuthor}
                                    onChange={(e) => setNewBookAuthor(e.target.value)}
                                    required
                                >
                                    <option value="">Select Author</option>
                                    {authors.map(author => (
                                        <option key={author.authorId} value={author.authorId}>{author.authorName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newBookPublication">
                                <Form.Label>Publication</Form.Label>
                                <Form.Select
                                    value={newBookPublication}
                                    onChange={(e) => setNewBookPublication(e.target.value)}
                                    required
                                >
                                    <option value="">Select Publication</option>
                                    {publications.map(publication => (
                                        <option key={publication.publicationId} value={publication.publicationId}>{publication.publicationName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <div className='d-flex justify-content-end'>
                                <Button className='button-color' type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Edit Book Modal */}
                <Modal show={showEditBookModal} onHide={() => { setShowEditBookModal(false); resetFormFields()}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Book</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editBook}>
                            <Form.Group className="mb-3" controlId="editedBookName">
                                <Form.Label>Book Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter edited book "
                                    value={newBookName}
                                    onChange={(e) => setNewBookName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editedBookAuthor">
                                <Form.Label>Author</Form.Label>
                                <Form.Select
                                    value={newBookAuthor}
                                    onChange={(e) => setNewBookAuthor(e.target.value)}
                                    required
                                >
                                    <option value="">Select Author</option>
                                    {authors.map(author => (
                                        <option key={author.authorId} value={author.authorId}>{author.authorName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editedBookPublication">
                                <Form.Label>Publication</Form.Label>
                                <Form.Select
                                    value={newBookPublication}
                                    onChange={(e) => setNewBookPublication(e.target.value)}
                                    required
                                >
                                    <option value="">Select Publication</option>
                                    {publications.map(publication => (
                                        <option key={publication.publicationId} value={publication.publicationId}>{publication.publicationName}</option>
                                    ))}
                                </Form.Select>
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
                    <Modal.Body>Are you sure you want to delete this book?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={deleteBook}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* View modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View Book </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label> Book</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook ? viewBook.bookName : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Author</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook?.author?.authorName || ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Publication</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook?.publication?.publicationName || ''}
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

export default Books;
