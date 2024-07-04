/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './AuthCSS/User.css';

const User = () => {
    //search
    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");
    useEffect(() => {
        setFiltered(users.filter(member =>
            member.username.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [dataQuery]);
    //get
    const [users, setUsers] = useState([]);
    //add
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newMobileNumber, setNewMobileNumber] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    //edit
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    // view
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchUsers();
    }, []);

    // get user
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching users: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.username.localeCompare(b.username));
            setUsers(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching users. Please try again later.');
        }
    };

    // Reset form fields
    const resetFormFields = () => {
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewMobileNumber('');
    };

    // add / post 
    const addUser = async (e) => {
        e.preventDefault();
        try {
            if (newMobileNumber.length !== 10) {
                toast.error('Mobile number must be exactly 10 digits.');
                return;
            }
            if (newUserPassword.length < 6) {
                toast.error('Password must be at least 6 characters.');
                return;
            }
            const response = await fetch(`${BaseURL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    mobileNo: parseInt(newMobileNumber)
                }),
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 400) {
                    if (responseData.message.includes('Username is already taken')) {
                        toast.info('Username is already exists.');
                    } else if (responseData.message.includes('Email is already in use')) {
                        toast.info('Email is already exists.');
                    } else {
                        toast.error('Error adding User. Please try again later.');
                    }
                } else {
                    throw new Error(`Error adding User: ${response.statusText}`);
                }
                return;
            }
            const newUser = responseData;
            setUsers([...users, newUser]);
            toast.success('User added successfully.');
            setShowAddUserModal(false);
            resetFormFields();
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error adding User. Please try again later.');
        }
    };

    //edit api
    const editUser = async (e) => {
        e.preventDefault();
        try {
            const mobileNo = parseInt(newMobileNumber, 10);
            const response = await fetch(`${BaseURL}/api/auth/${selectedUserId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUserName,
                    useremail: newUserEmail,
                    userpassword: newUserPassword,
                    mobileNo: mobileNo
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message.includes('username_UNIQUE')) {
                    toast.info('Username already exists.');
                } else if (errorData.message.includes('useremail_UNIQUE')) {
                    toast.info('Email already exists.');
                } else {
                    throw new Error(`Error editing User: ${response.statusText}`);
                }
                return;
            }
            const updatedUserData = await response.json();
            const updatedUsers = users.map(user => {
                if (user.userId === selectedUserId) {
                    return { ...user, username: updatedUserData.username, block: updatedUserData.block };
                }
                return user;
            });
            setUsers(updatedUsers);
            toast.success('User edited successfully.');
            setShowEditUserModal(false);
            resetFormFields();
            fetchUsers();
        } catch (error) {
            toast.error('Error editing User. Please try again later.');
        }
    };

    // Delete api
    const deleteUser = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/${selectedUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Error deleting User: ${response.statusText}`);
            }
            setUsers(users.filter(user => user.userId !== selectedUserId));
            toast.success('User deleted successfully.');
            setShowDeleteConfirmation(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting User. Please try again later.');
        }
    };

    // view
    const handleShowViewModal = (user) => {
        setViewUser(user);
        setShowViewModal(true);
    };

    // Pagination 
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
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
    const totalPages = Math.ceil(filtered.length / perPage);
    const currentData = filtered.slice(indexOfNumber, indexOfLastBookType);

    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-3 d-flex justify-content-between'>
                    <Button onClick={() => setShowAddUserModal(true)} className="button-color">
                        Add User
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search user Name"
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
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((user, index) => (
                                    <tr key={user.userId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{user.username}</td>
                                        <td>{user.useremail}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                setSelectedUserId(user.userId);
                                                setNewUserName(user.username);
                                                setNewUserEmail(user.useremail);
                                                setNewMobileNumber(user.mobileNo.toString());
                                                setNewUserPassword('');
                                                setShowEditUserModal(true);
                                            }} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                                setSelectedUserId(user.userId);
                                                setShowDeleteConfirmation(true);
                                            }} />
                                            <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(user)} />
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

                {/* Add User Modal */}
                <Modal show={showAddUserModal} onHide={() => { setShowAddUserModal(false); resetFormFields(); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addUser}>
                            <Form.Group className="mb-3" controlId="newUserName">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="User name"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newUserMobile">
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={newMobileNumber}
                                    maxLength={10}
                                    pattern="\d{10}"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && value.length <= 10) {
                                            setNewMobileNumber(value);
                                        }
                                    }}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newUserEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newUserPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
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

                {/* Edit User Modal */}
                <Modal show={showEditUserModal} onHide={() => { setShowEditUserModal(false); resetFormFields(); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editUser}>
                            <Form.Group className="mb-3" controlId="editedUserName">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter edited User name"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newUserMobile">
                                <Form.Label>Mobile No</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={newMobileNumber}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && value.length <= 10) {
                                            setNewMobileNumber(value);
                                        }
                                    }}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editedEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter edited email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="editedPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter edited password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
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
                    <Modal.Body>Are you sure you want to delete this User?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={deleteUser}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* View User Modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>User</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewUser ? viewUser.username : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Mobile No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewUser ? viewUser.mobileNo : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewUser ? viewUser.useremail : ''}
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

export default User;
