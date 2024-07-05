/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Books = () => {
    //search
    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");
    useEffect(() => {
        setFiltered(books.filter(member =>
            member.bookName.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [dataQuery]);
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
    //book type
    const [bookTypes, setBookTypes] = useState([]);
    const [newBookTypeName, setNewBookTypeName] = useState('');
    //book language
    const [bookLanguages, setBookLanguages] = useState([]);
    const [addBookLangName, setAddBookLangName] = useState('');
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchBooks();
        fetchAuthors();
        fetchPublications();
        fetchBookTypes();
        fetchBookLanguages();
    }, []);

    //get api
    const fetchBooks = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book/all`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching books: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.data.sort((a, b) => a.bookName.localeCompare(b.bookName));
            setBooks(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching books. Please try again later.');
        }
    };

    // get authors 
    const fetchAuthors = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book-authors`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
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

    // get publications
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
            setPublications(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching publications. Please try again later.');
        }
    };

    //get  book types
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
            setBookTypes(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching book types. Please try again later.');
        }
    };

    // get  languages
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
            setBookLanguages(data.data);
        } catch (error) {
            console.error('Error fetching book languages:', error);
        }
    };

    // Reset form fields
    const resetFormFields = () => {
        setNewBookName('');
        setNewBookAuthor('');
        setNewBookPublication('');
        setNewBookTypeName('');
        setAddBookLangName('');
    };

    //add or post api
    const addBook = async (e) => {
        e.preventDefault();
        const reportData = {
            bookName: newBookName,
            authorId: newBookAuthor,
            publicationId: newBookPublication,
            bookTypeId: newBookTypeName,
            bookLangId: addBookLangName
        };
        try {
            const response = await fetch(`${BaseURL}/api/book/book`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409) {
                    toast.info(`Cannot add book: ${responseData.message}`);
                    return;
                }
                throw new Error(`Error adding book: ${responseData.message || response.statusText}`);
            }
            setBooks(books => [...books, responseData.data]);
            toast.success('Book added successfully.');
            resetFormFields();
            setShowAddBookModal(false);
            fetchBooks();
        } catch (error) {
            toast.error('Error adding book. Please try again later.');
        }
    };

    // Edit api
    const editBook = async (e) => {
        e.preventDefault();
        const reportData = {
            bookName: newBookName,
            authorId: newBookAuthor,
            publicationId: newBookPublication,
            bookTypeId: newBookTypeName,
            bookLangId: addBookLangName
        };
        try {
            const response = await fetch(`${BaseURL}/api/book/book/${selectedBookId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 409) {
                    toast.info(`Cannot edit book: ${responseData.message}`);
                    return;
                }
                throw new Error(`Error editing book: ${responseData.message || response.statusText}`);
            }
            const updatedBooks = books.map(book => {
                if (book.bookId === selectedBookId) {
                    return { ...book, ...responseData.data };
                }
                return book;
            });
            setBooks(updatedBooks);
            toast.success('Book edited successfully.');
            setShowEditBookModal(false);
            resetFormFields();
            fetchBooks();
        } catch (error) {
            toast.error('Error editing book. Please try again later.');
        }
    };

    // Delete api
    const deleteBook = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/book/book/${selectedBookId}`, {
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
            setBooks(books.filter(book => book.bookId !== selectedBookId));
            setShowDeleteConfirmation(false);
            toast.success('Book deleted successfully.');
            fetchBooks();
        } catch (error) {
            console.error(error);
            toast.info(error.message || 'Error deleting book. Please try again later.');
        }
    };

    // View function
    const handleShowViewModal = (book) => {
        setViewBook(book);
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
                    <Button onClick={() => setShowAddBookModal(true)} className="button-color">
                        Add Book
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search by Book"
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
                                    <th>Book</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((book, index) => (
                                    <tr key={book.bookId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{book.bookName}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                setSelectedBookId(book.bookId);
                                                setNewBookName(book.bookName);
                                                setNewBookAuthor(book.authorIdF.authorId);
                                                setNewBookPublication(book.publicationIdF.publicationId);
                                                setNewBookTypeName(book.bookTypeIdF.bookTypeId);
                                                setAddBookLangName(book.bookLangIdF.bookLangId);
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
                    </div>
                    <div className="pagination-container">
                        <Button onClick={handleFirstPage} disabled={currentPage === 1}>First Page</Button>
                        <Button onClick={handlePrevPage} disabled={currentPage === 1}> <ChevronLeft /></Button>
                        <div className="pagination-text">Page {currentPage} of {totalPages}</div>
                        <Button onClick={handleNextPage} disabled={currentPage === totalPages}> <ChevronRight /></Button>
                        <Button onClick={handleLastPage} disabled={currentPage === totalPages}>Last Page</Button>
                    </div>
                </div>

                {/* Add Book Modal */}
                <Modal show={showAddBookModal} onHide={() => { setShowAddBookModal(false); resetFormFields() }}>
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
                            <Form.Group className="mb-3" controlId="newBookPublication">
                                <Form.Label>Book Type</Form.Label>
                                <Form.Select
                                    value={newBookTypeName}
                                    onChange={(e) => setNewBookTypeName(e.target.value)}
                                    required
                                >
                                    <option value="">Select Book TYpe</option>
                                    {bookTypes.map(bookType => (
                                        <option key={bookType.bookTypeId} value={bookType.bookTypeId}>{bookType.bookTypeName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newBookPublication">
                                <Form.Label>Languages</Form.Label>
                                <Form.Select
                                    value={addBookLangName}
                                    onChange={(e) => setAddBookLangName(e.target.value)}
                                    required
                                >
                                    <option value="">Select languages</option>
                                    {bookLanguages.map(languages => (
                                        <option key={languages.bookLangId} value={languages.bookLangId}>{languages.bookLangName}</option>
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
                <Modal show={showEditBookModal} onHide={() => { setShowEditBookModal(false); resetFormFields() }}>
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

                            <Form.Group className="mb-3" controlId="newBookPublication">
                                <Form.Label>Book Type</Form.Label>
                                <Form.Select
                                    value={newBookTypeName}
                                    onChange={(e) => setNewBookTypeName(e.target.value)}
                                    required
                                >
                                    <option value="">Select Book TYpe</option>
                                    {bookTypes.map(bookType => (
                                        <option key={bookType.bookTypeId} value={bookType.bookTypeId}>{bookType.bookTypeName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newBookPublication">
                                <Form.Label>Languages</Form.Label>
                                <Form.Select
                                    value={addBookLangName}
                                    onChange={(e) => setAddBookLangName(e.target.value)}
                                    required
                                >
                                    <option value="">Select languages</option>
                                    {bookLanguages.map(languages => (
                                        <option key={languages.bookLangId} value={languages.bookLangId}>{languages.bookLangName}</option>
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
                                        value={viewBook?.authorIdF.authorName || ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Publication</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook?.publicationIdF.publicationName || ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Book Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook?.bookTypeIdF.bookTypeName || ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Language</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewBook?.bookLangIdF.bookLangName || ''}
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
