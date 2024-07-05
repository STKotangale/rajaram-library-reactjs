/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Auth/AuthProvider';
import { Button, Modal, Form, Table, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilSquare } from 'react-bootstrap-icons';

const Config = () => {
    // State variables
    const [config, setConfig] = useState([]);
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;
    const [showModal, setShowModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null); 

    // Fetch config data from API
    const fetchConfig = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/config`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching Config: ${response.statusText}`);
            }
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching Config. Please try again later.');
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // Handle click on update icon
    const handleUpdateClick = (fee) => {
        setSelectedFee(fee);
        setShowModal(true);
    };

    // Handle form submission for update
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BaseURL}/api/config/${selectedFee.srno}`, { // Update to use selectedFee.srno
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookDays: selectedFee.bookDays,
                    finePerDays: selectedFee.finePerDays,
                    monthlyFees: selectedFee.monthlyFees
                })
            });
            if (!response.ok) {
                throw new Error(`Error updating Config: ${response.statusText}`);
            }
            toast.success('Config updated successfully!');
            fetchConfig();
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Error updating Config. Please try again later.');
        }
    };

    // Handle input change in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedFee({ ...selectedFee, [name]: value });
    };

    return (
        <div className='padding-class'>
            <div className="main-content">
                <Container className='small-screen-table'>
                    <div>
                        <div className='table-responsive mt-3 table-height'>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Sr.No</th>
                                        <th>Book Days</th>
                                        <th>Fine per Days</th>
                                        <th>Monthly Fees</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {config.map((fee, index) => (
                                        <tr key={fee.srno}> {/* Changed from feesId to srno */}
                                            <td>{index + 1}</td>
                                            <td>{fee.bookDays}</td>
                                            <td>{fee.finePerDays}</td>
                                            <td>{fee.monthlyFees}</td>
                                            <td>
                                                <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => handleUpdateClick(fee)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Modal for updating fee */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Library Fee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFee && (
                        <Form onSubmit={handleFormSubmit}>
                            <Form.Group controlId="formBookDays">
                                <Form.Label>Book Days</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="bookDays"
                                    value={selectedFee.bookDays}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formFinePerDays">
                                <Form.Label>Fine per Days</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="finePerDays"
                                    value={selectedFee.finePerDays}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formMonthlyFees">
                                <Form.Label>Monthly Fees</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="monthlyFees"
                                    value={selectedFee.monthlyFees}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <div className='d-flex justify-content-end mt-2'>
                                <Button variant="primary" type="submit">
                                    Update
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Config;
