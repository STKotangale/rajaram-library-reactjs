/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuthCSS/PermanentGeneralMember.css';


const GeneralMember = () => {
     //get
     const [generalMember, setGeneralMember] = useState([]);
    //search function
    const [filteredMember, setFilteredMember] = useState([]);
    const [firstNameQuery, setFirstNameQuery] = useState("");
    const [middleNameQuery, setMiddleNameQuery] = useState("");
    const [lastNameQuery, setLastNameQuery] = useState("");
    useEffect(() => {
        setFilteredMember(generalMember.filter(member =>
            member.firstName.toLowerCase().includes(firstNameQuery.toLowerCase()) &&
            member.middleName.toLowerCase().includes(middleNameQuery.toLowerCase()) &&
            member.lastName.toLowerCase().includes(lastNameQuery.toLowerCase())
        ));
        setCurrentPage(1);
    }, [firstNameQuery, middleNameQuery, lastNameQuery]);
    //add
    const [showAddGeneralMemberModal, setShowAddGeneralMemberModal] = useState(false);
    const [newGeneralMember, setNewGeneralMember] = useState({
        username: '',
        firstName: '',
        middleName: '',
        lastName: '',
        registerDate: '',
        adharCard: '',
        memberAddress: '',
        dateOfBirth: '',
        memberEducation: '',
        memberOccupation: '',
        mobileNo: '',
        memberEmailId: '',
        confirmDate: '',
        password: '',
        libGenMembNo: '',
    });
    //edit 
    const [showEditGeneralMemberModal, setShowEditGeneralMemberModal] = useState(false);
    const [editGeneralMemberData, setEditGeneralMemberData] = useState({});
    //delete
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedGeneralMemberId, setSelectedGeneralMemberId] = useState(null);
    //view 
    const [showViewGeneralMemberModal, setShowViewGeneralMemberModal] = useState(false);
    const [viewGeneralMemberData, setViewGeneralMemberData] = useState(null);
    //auth
    const { accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchGeneralMembers();
    }, []);

    //get general member
    const fetchGeneralMembers = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/general-members`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const sortedData = data.data.map(member => ({
                ...member,
                fullName: `${member.firstName} ${member.middleName} ${member.lastName}`
            })).sort((a, b) => a.fullName.localeCompare(b.fullName));

            setGeneralMember(sortedData);
            setFilteredMember(sortedData);
        } catch (error) {
            console.error("Failed to fetch general members:", error);
            toast.error('Failed to load general members. Please try again later.');
        }
    };

    // Reset form fields
    const resetFormFields = () => {
        setNewGeneralMember({
            username: '',
            firstName: '',
            middleName: '',
            lastName: '',
            registerDate: '',
            adharCard: '',
            memberAddress: '',
            dateOfBirth: '',
            memberEducation: '',
            memberOccupation: '',
            mobileNo: '',
            memberEmailId: '',
            confirmDate: '',
            password: '',
            libGenMembNo: '',
        });
    };

    //post function
    //date format dd-mm-yyyy
    const parseDate = (date) => {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    //add or post api
    const addGeneralMember = async (e) => {
        e.preventDefault();
        try {
            const mobileNo = parseInt(newGeneralMember.mobileNo);
            const payload = {
                ...newGeneralMember,
                mobileNo,
                registerDate: parseDate(newGeneralMember.registerDate),
                dateOfBirth: parseDate(newGeneralMember.dateOfBirth),
                confirmDate: parseDate(newGeneralMember.confirmDate)
            };
            const response = await fetch(`${BaseURL}/api/general-members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    if (errorData.message.includes('username_UNIQUE')) {
                        toast.info('Username already exists.');
                    } else if (errorData.message.includes('useremail_UNIQUE')) {
                        toast.info('Email already exists.');
                    } else {
                        toast.error(errorData.message);
                    }
                } else {
                    throw new Error(`Error adding general member: ${response.statusText}`);
                }
            } else {
                const data = await response.json();
                setGeneralMember([...generalMember, data.data]);
                toast.success('General member added successfully.');
                setShowAddGeneralMemberModal(false);
                resetFormFields();
                fetchGeneralMembers();
            }
        } catch (error) {
            toast.error('Error adding general member. Please try again later.');
        }
    };

    //edit function
    //date format for edit
    const formatDate = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    //handle edit function
    const handleEditOpenGeneralMember = (memberId) => {
        const memberToEdit = generalMember.find(member => member.memberId === memberId);
        if (memberToEdit) {
            const formattedData = {
                ...memberToEdit,
                registerDate: formatDate(memberToEdit.registerDate),
                dateOfBirth: formatDate(memberToEdit.dateOfBirth),
                confirmDate: formatDate(memberToEdit.confirmDate)
            };
            setEditGeneralMemberData(formattedData);
            setShowEditGeneralMemberModal(true);
        }
    };

    //edit api
    const editGeneralMember = async (e) => {
        e.preventDefault();
        try {
            if (!editGeneralMemberData || !editGeneralMemberData.memberId) {
                throw new Error('No memberId provided for editing.');
            }
            const { memberId, ...requestData } = editGeneralMemberData;
            const payload = {
                firstName: requestData.firstName,
                middleName: requestData.middleName,
                lastName: requestData.lastName,
                adharCard: requestData.adharCard,
                memberAddress: requestData.memberAddress,
                memberEducation: requestData.memberEducation,
                memberOccupation: requestData.memberOccupation,
                mobileNo: requestData.mobileNo,
                memberEmailId: requestData.email,
                username: requestData.username,
                password: requestData.password,
                registerDate: parseDate(requestData.registerDate),
                dateOfBirth: parseDate(requestData.dateOfBirth),
                confirmDate: parseDate(requestData.confirmDate),
                libGenMembNo: requestData.libGenMembNo,
            };
            const response = await fetch(`${BaseURL}/api/general-members/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message.includes('username_UNIQUE')) {
                    toast.info('Username already exists.');
                } else if (errorData.message.includes('useremail_UNIQUE')) {
                    toast.info('Email already exists.');
                } else {
                    throw new Error(`Error editing general member: ${response.statusText}`);
                }
                return;
            }
            const updatedGeneralMemberData = await response.json();
            const updatedGeneralMembers = generalMember.map(member => {
                if (member.memberId === updatedGeneralMemberData.data.memberId) {
                    return updatedGeneralMemberData.data;
                }
                return member;
            });
            setGeneralMember(updatedGeneralMembers);
            setShowEditGeneralMemberModal(false);
            toast.success('General member edited successfully.');
            fetchGeneralMembers();
        } catch (error) {
            toast.error('Error editing general member. Please try again later.');
        }
    };

   // Delete API
const deleteGeneralMember = async () => {
    try {
        const response = await fetch(`${BaseURL}/api/general-members/${selectedGeneralMemberId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const responseData = await response.json();
        if (!response.ok) {
            if (response.status === 409) {
                toast.info(`Cannot delete member: ${responseData.message}`);
                return;
            }
            throw new Error(`Error deleting general member: ${responseData.message || response.statusText}`);
        }
        setGeneralMember(generalMember.filter(member => member.id !== selectedGeneralMemberId));
        setShowDeleteConfirmation(false);
        toast.success('General member deleted successfully.');
        fetchGeneralMembers();
    } catch (error) {
        toast.error('Error deleting general member. Please try again later.');
    }
};


    //view
    const handleViewOpenGeneralMember = (member) => {
        setViewGeneralMemberData(member);
        setShowViewGeneralMemberModal(true);
    };


    //pagination function
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(filteredMember.length / perPage);
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
    const currentData = filteredMember.slice(indexOfNumber, indexOfLastBookType);


    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-3 d-flex justify-content-between'>
                    <Button onClick={() => setShowAddGeneralMemberModal(true)} className="button-color">
                        Add General Member
                    </Button>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Search by First Name"
                            value={firstNameQuery}
                            onChange={(e) => setFirstNameQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Search by Middle Name"
                            value={middleNameQuery}
                            onChange={(e) => setMiddleNameQuery(e.target.value)}
                            className="me-2 border border-success"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Search by Last Name"
                            value={lastNameQuery}
                            onChange={(e) => setLastNameQuery(e.target.value)}
                            className="border border-success"
                        />
                    </div>
                </div>
                <div className='mt-3 table-container-general-member-1'>
                    <div className="table-responsive table-height">
                        <Table striped bordered hover >
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Member Name</th>
                                    <th>Register Date</th>
                                    <th>Mobile No</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((member, index) => (
                                    <tr key={member.memberId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{member.fullName}</td>
                                        <td>{member.registerDate}</td>
                                        <td>{member.mobileNo}</td>
                                        <td>
                                            <PencilSquare
                                                className="ms-3 action-icon edit-icon"
                                                onClick={() => handleEditOpenGeneralMember(member.memberId)}
                                            />
                                            <Trash
                                                className="ms-3 action-icon delete-icon"
                                                onClick={() => {
                                                    setSelectedGeneralMemberId(member.memberId);
                                                    setShowDeleteConfirmation(true);
                                                }}
                                            />
                                            <Eye
                                                className="ms-3 action-icon view-icon"
                                                onClick={() => handleViewOpenGeneralMember(member)}
                                            />
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
            </Container>


            {/* Add General member Modal */}
            <Modal show={showAddGeneralMemberModal} onHide={() => { setShowAddGeneralMemberModal(false); resetFormFields() }} size='xl' bg='light'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Add New General Member</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={addGeneralMember}>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={newGeneralMember.firstName}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, firstName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberMiddleName">
                                    <Form.Label>Middle Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Middle Name"
                                        value={newGeneralMember.middleName}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, middleName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Last Name"
                                        value={newGeneralMember.lastName}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, lastName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberMobileNo">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={newGeneralMember.mobileNo}
                                        maxLength={10}
                                        pattern="\d{10}"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 10 && /^\d*$/.test(value)) {
                                                setNewGeneralMember({ ...newGeneralMember, mobileNo: value });
                                            }
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberAadharCard">
                                    <Form.Label>Aadhar Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Aadhar Number"
                                        maxLength={12}
                                        pattern="\d{12}"
                                        value={newGeneralMember.adharCard}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 12 && /^\d*$/.test(value)) {
                                                setNewGeneralMember({ ...newGeneralMember, adharCard: value });
                                            }
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberEmailId">
                                    <Form.Label>Email Id</Form.Label>
                                    <Form.Control
                                        type="Email"
                                        placeholder="Email"
                                        value={newGeneralMember.memberEmailId}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, memberEmailId: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberEducation">
                                    <Form.Label> Education</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Education"
                                        value={newGeneralMember.memberEducation}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, memberEducation: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberOccupation">
                                    <Form.Label>Occupation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Occupation"
                                        value={newGeneralMember.memberOccupation}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, memberOccupation: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberAddress">
                                    <Form.Label>Address </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Address"
                                        value={newGeneralMember.memberAddress}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, memberAddress: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberDateOfBirth">
                                    <Form.Label>Date Of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newGeneralMember.dateOfBirth}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, dateOfBirth: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberRegisterDate">
                                    <Form.Label>Register Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newGeneralMember.registerDate}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, registerDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberConfirmDate">
                                    <Form.Label>Confirm Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={newGeneralMember.confirmDate}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, confirmDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberlibParMembNo">
                                    <Form.Label>Libaray Member Number </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Member Number"
                                        value={newGeneralMember.libGenMembNo}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, libGenMembNo: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" as={Col} lg={4} controlId="newGeneralMemberUsename">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Username"
                                        value={newGeneralMember.username}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, username: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" as={Col} lg={4} controlId="newGeneralMemberPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={newGeneralMember.password}
                                        onChange={(e) => setNewGeneralMember({ ...newGeneralMember, password: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <div className='d-flex justify-content-end'>
                                <Button className='button-color' type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </div>
            </Modal>


            {/* Edit General member Modal */}
            <Modal show={showEditGeneralMemberModal} onHide={() => { setShowEditGeneralMemberModal(false); resetFormFields(); }} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit General Member</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editGeneralMember}>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={editGeneralMemberData ? editGeneralMemberData.firstName : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, firstName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberMiddleName">
                                    <Form.Label>Middle Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Middle Name"
                                        value={editGeneralMemberData ? editGeneralMemberData.middleName : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, middleName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Last Name"
                                        value={editGeneralMemberData ? editGeneralMemberData.lastName : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, lastName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberMobileNo">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Mobile number"
                                        maxLength={10}
                                        pattern="\d{10}"
                                        value={editGeneralMemberData ? editGeneralMemberData.mobileNo : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 12 && /^\d*$/.test(value)) {
                                                setEditGeneralMemberData({ ...editGeneralMemberData, mobileNo: value })
                                            }
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberAadharCard">
                                    <Form.Label>Aadhar Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Aadhar Number"
                                        maxLength={12}
                                        pattern="\d{12}"
                                        value={editGeneralMemberData ? editGeneralMemberData.adharCard : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 12 && /^\d*$/.test(value)) {
                                                setEditGeneralMemberData({ ...editGeneralMemberData, adharCard: value })
                                            }
                                        }}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberEmailId">
                                    <Form.Label>Email Id</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email Id"
                                        value={editGeneralMemberData ? editGeneralMemberData.email : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, email: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberEducation">
                                    <Form.Label>Education</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Education"
                                        value={editGeneralMemberData ? editGeneralMemberData.memberEducation : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, memberEducation: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberOccupation">
                                    <Form.Label>Occupation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Occupation"
                                        value={editGeneralMemberData ? editGeneralMemberData.memberOccupation : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, memberOccupation: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberAddress">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Address"
                                        value={editGeneralMemberData ? editGeneralMemberData.memberAddress : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, memberAddress: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberDateOfBirth">
                                    <Form.Label>Date Of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editGeneralMemberData ? editGeneralMemberData.dateOfBirth : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, dateOfBirth: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberRegisterDate">
                                    <Form.Label>Register Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editGeneralMemberData ? editGeneralMemberData.registerDate : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, registerDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="editedGeneralMemberConfirmDate">
                                    <Form.Label>Confirm Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editGeneralMemberData ? editGeneralMemberData.confirmDate : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, confirmDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" lg={4} as={Col} controlId="newGeneralMemberlibParMembNo">
                                    <Form.Label>Libaray Member No </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Member No"
                                        value={editGeneralMemberData ? editGeneralMemberData.libGenMembNo : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, libGenMembNo: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" as={Col} lg={4} controlId="editedGeneralMemberUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editGeneralMemberData ? editGeneralMemberData.username : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, username: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" as={Col} lg={4} controlId="editedGeneralMemberPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={editGeneralMemberData ? editGeneralMemberData.password : ''}
                                        onChange={(e) => setEditGeneralMemberData({ ...editGeneralMemberData, password: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Row>
                            <div className='d-flex justify-content-end'>
                                <Button className='button-color' type="submit">
                                    Update
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </div>
            </Modal>


            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this general member?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteGeneralMember}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* View general Modal */}
            <Modal show={showViewGeneralMemberModal} onHide={() => setShowViewGeneralMemberModal(false)} size="xl">
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>View General Member Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {viewGeneralMemberData && (
                            <Form>
                                <Row className="mb-3">
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.firstName} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Middle Name</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.middleName} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.lastName} />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Mobile No</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.mobileNo} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Aadhar No</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.adharCard} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" readOnly defaultValue={viewGeneralMemberData.email} />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Education</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.memberEducation} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Occupation</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.memberOccupation} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.memberAddress} />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Date of Birth</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.dateOfBirth} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Register Date</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.registerDate} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Confirm Date</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.confirmDate} />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Libaray Member No </Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.libGenMembNo} />
                                    </Form.Group>
                                    <Form.Group as={Col} lg={4} className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" readOnly defaultValue={viewGeneralMemberData.username} />
                                    </Form.Group>
                                </Row>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewGeneralMemberModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

        </div>
    );
};

export default GeneralMember;
