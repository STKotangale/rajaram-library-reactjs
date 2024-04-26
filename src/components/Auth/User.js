/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col, Pagination } from 'react-bootstrap';
import { Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchUsers();
    }, []);

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
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching users. Please try again later.');
        }
    };

    const handlePageClick = (page) => setCurrentPage(page);
    const paginationItems = users ? Array.from({ length: Math.ceil(users.length / itemsPerPage) }, (_, i) => i + 1).map(number => (
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageClick(number)}>
            {number}
        </Pagination.Item>
    )) : null;
    

    const indexOfLastUser = users ? currentPage * itemsPerPage : 0;
    const indexOfFirstUser = users ? indexOfLastUser - itemsPerPage : 0;
    // const currentUsers = users ? users.slice(indexOfFirstUser, indexOfLastUser) : [];
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const addUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username: newUserName,
                    email: newUserEmail,
                    password: newUserPassword 
                }),
            });
            if (!response.ok) {
                throw new Error(`Error adding User: ${response.statusText}`);
            }
            const newUser = await response.json();
            setUsers([...users, newUser]);
            setShowAddUserModal(false);
            toast.success('User added successfully.');
            // Reset form fields
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error adding User. Please try again later.');
        }
    };

    const editUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/auth/${selectedUserId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUserName,email: newUserEmail, password: newUserPassword }),
            });
            if (!response.ok) {
                throw new Error(`Error editing User: ${response.statusText}`);
            }
            const updatedUserData = await response.json();
            const updatedUsers = users.map(user => {
                if (user.id === selectedUserId) {
                    return { ...user, username: updatedUserData.username, block: updatedUserData.block };
                }
                return user;
            });
            setUsers(updatedUsers);
            setShowEditUserModal(false);
            toast.success('User edited successfully.');
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error editing User. Please try again later.');
        }
    };

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
            setUsers(users.filter(user => user.id !== selectedUserId));
            setShowDeleteConfirmation(false);
            toast.success('User deleted successfully.');
        } catch (error) {
            console.error(error);
            toast.error('Error deleting User. Please try again later.');
        }
    };

    const handleShowViewModal = (user) => {
        setViewUser(user);
        setShowViewModal(true);
    };

    return (
        <div className="main-content">
            <Container>
                <div className='mt-3'>
                    <Button onClick={() => setShowAddUserModal(true)} className="button-color">
                        Add User
                    </Button>
                </div>
                <div className='mt-3'>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Users</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                    <td>
                                        <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                            setSelectedUserId(user.id);
                                            setNewUserName(user.username);
                                            setNewUserEmail(user.email); 
                                            setNewUserPassword('');
                                            setShowEditUserModal(true);
                                        }} />
                                        <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                            setSelectedUserId(user.id);
                                            setShowDeleteConfirmation(true);
                                        }} />
                                        <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(user)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>{paginationItems}</Pagination>
                </div>


                {/* Add Book Modal */}
                <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addUser}>
                            <Form.Group className="mb-3" controlId="newUserName">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter User name"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newUserEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="text"
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
                <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
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


                {/* View modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View User </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label> User</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewUser ? viewUser.username : ''}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">

                            <Form.Group as={Col}>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewUser ? viewUser.email : ''}
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