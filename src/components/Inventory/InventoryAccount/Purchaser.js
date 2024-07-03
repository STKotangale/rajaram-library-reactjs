/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Purchaser = () => {

    //search unction
    const [filtered, setFiltered] = useState([]);
    const [dataQuery, setDataQuery] = useState("");
    useEffect(() => {
        setFiltered(ledger.filter(member =>
            member.ledgerName.toLowerCase().includes(dataQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [dataQuery]);
    //get
    const [ledger, setLedger] = useState([]);
    //add
    const [showAddLedgerModal, setShowAddLedgerModal] = useState(false);
    const [newLedgerName, setNewLedgerName] = useState('');
    //edit
    const [showEditLedgerModal, setShowEditLedgerModal] = useState(false);
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    //edit and delete
    const [selectedLedgerId, setSelectedLedgerId] = useState(null);
    // View 
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewLedger, setViewLedger] = useState(null);
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchLedger();
    }, []);


    //get purchaser / ledger
    const fetchLedger = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/ledger`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching ledger: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.data.sort((a, b) => a.ledgerName.localeCompare(b.ledgerName));
            setLedger(sortedData);
            setFiltered(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching ledger. Please try again later.');
        }
    };

    // Reset  fields
    const resetFormFields = () => {
        setNewLedgerName('');
    };

    //add api
    const addLedger = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/ledger`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ledgerName: newLedgerName }),

            });
            if (!response.ok) {
                throw new Error(`Error adding ledger: ${response.statusText}`);
            }
            const newLedger = await response.json();
            setLedger([...ledger, newLedger.data]);
            toast.success('Purchaser added successfully.');
            setShowAddLedgerModal(false);
            resetFormFields();
            fetchLedger();
        } catch (error) {
            console.error(error);
            toast.error('Error adding ledger. Please try again later.');
        }
    };

    //edit api
    const editLedger = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/ledger/${selectedLedgerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ledgerName: newLedgerName }),
            });
            if (!response.ok) {
                throw new Error(`Error editing ledger: ${response.statusText}`);
            }
            const updatedLedgerData = await response.json();
            const updatedLedger = ledger.map(item => {
                if (item.ledgerID === selectedLedgerId) {
                    return { ...item, ledgerName: updatedLedgerData.data.ledgerName };
                }
                return item;
            });
            setLedger(updatedLedger);
            toast.success('Ledger edited successfully.');
            setShowEditLedgerModal(false);
            fetchLedger();
        } catch (error) {
            console.error(error);
            toast.error('Error editing ledger. Please try again later.');
        }
    };

    //delete api
    const deleteLedger = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/ledger/${selectedLedgerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Error deleting ledger: ${response.statusText}`);
            }
            setLedger(ledger.filter(item => item.ledgerID !== selectedLedgerId));
            setShowDeleteConfirmation(false);
            toast.success('Ledger deleted successfully.');
            fetchLedger();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting ledger. Please try again later.');
        }
    };

    //view function
    const handleShowViewModal = (ledger) => {
        setViewLedger(ledger);
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
                    <Button onClick={() => setShowAddLedgerModal(true)} className="button-color">
                        Add Purchaser
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search Purchaser Name"
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
                                    <th>Purchaser</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((ledger, index) => (
                                    <tr key={ledger.ledgerID}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{ledger.ledgerName}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => {
                                                setSelectedLedgerId(ledger.ledgerID);
                                                setNewLedgerName(ledger.ledgerName);
                                                setShowEditLedgerModal(true);
                                            }} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => {
                                                setSelectedLedgerId(ledger.ledgerID);
                                                setShowDeleteConfirmation(true);
                                            }} />
                                            <Eye className="ms-3 action-icon delete-icon" onClick={() => handleShowViewModal(ledger)} />
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


                {/* Add Purchaser Modal */}
                <Modal show={showAddLedgerModal} onHide={() => { setShowAddLedgerModal(false); resetFormFields() }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Purchaser</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addLedger}>
                            <Form.Group className="mb-3" controlId="newLedgerName">
                                <Form.Label>Purchaser Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Purchaser Name"
                                    value={newLedgerName}
                                    onChange={(e) => setNewLedgerName(e.target.value)}
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

                {/* Edit Purchaser Modal */}
                <Modal show={showEditLedgerModal} onHide={() => { setShowEditLedgerModal(false); resetFormFields() }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Purchaser</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editLedger}>
                            <Form.Group className="mb-3" controlId="editedLedgerName">
                                <Form.Label>Purchaser Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Purchaser Name"
                                    value={newLedgerName}
                                    onChange={(e) => setNewLedgerName(e.target.value)}
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
                    <Modal.Body>Are you sure you want to delete this purchaser?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={deleteLedger}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>


                {/* View Ledger Modal */}
                <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View Purchaser</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Purchaser Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewLedger ? viewLedger.ledgerName : ''}
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

export default Purchaser;
