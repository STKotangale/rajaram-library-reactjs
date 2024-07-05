/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Table, Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../Auth/AuthProvider';
import { ChevronLeft, ChevronRight, Eye, PencilSquare, Trash } from 'react-bootstrap-icons';

const MembershipFees = () => {
    //get all
    const [memberData, setMemberData] = useState([]);
    //get member 
    const [generalMember, setGeneralMember] = useState([]);
    const [selectedMemberName, setSelectedMemberName] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    //get fees data
    const [feesData, setFeesData] = useState([]);
    // get invoice number
    const [invoiceNumber, setInvoiceNumber] = useState('');
    //add
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        invoiceDate: new Date().toISOString().substr(0, 10),
        selectedMemberId: "",
        feeType: "",
        bankName: "",
        chequeNo: "",
        chequeDate: "",
        monthlyDescription: ""
    });
    const [selectedMemberLibNo, setSelectedMemberLibNo] = useState('');
    //edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        membershipId: "",
        invoiceDate: new Date().toISOString().substr(0, 10),
        selectedMemberName: "",
        selectedMemberId: "",
        feeType: "",
        bankName: "",
        chequeNo: "",
        chequeDate: "",
        monthlyDescription: ""
    });
    //delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    //view
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState({});
    //auth
    const { username, accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchMemberData();
        fetchLatestNo();
        fetchGeneralMembers();
        fetchFeesData();
    }, [username, accessToken]);

    //get membership data
    const fetchMemberData = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/membership-fees`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching member data: ${response.statusText}`);
            }
            const data = await response.json();
            const sortedData = data.map(member => ({
                ...member,
                fullName: `${member.firstName} ${member.middleName} ${member.lastName}`
            })).sort((a, b) => a.fullName.localeCompare(b.fullName));

            setMemberData(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching member data. Please try again later.');
        }
    };

    // get  invoice number
    const fetchLatestNo = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/membership-fees/nextInvoiceMembershipNo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching latest book lost number: ${response.statusText}`);
            }
            const data = await response.json();
            setInvoiceNumber(data.nextMonthlyMemberInvoiceNo);
        } catch (error) {
            console.error('Error fetching latest book lost number:', error);
            toast.error('Error fetching latest book lost number. Please try again later.');
        }
    };

    //get general number
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
            setGeneralMember(data.data.map(member => ({
                ...member,
                fullName: `${member.firstName} ${member.middleName} ${member.lastName}`
            })));
        } catch (error) {
            console.error("Failed to fetch general members:", error);
            toast.error('Failed to load general members. Please try again later.');
        }
    };

    //get fees data
    const fetchFeesData = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/fees`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching fees data: ${response.statusText}`);
            }
            const data = await response.json();
            setFeesData(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching fees data. Please try again later.');
        }
    };

    //input change for add modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };



    const formatDate = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    // Handle member change add modal
    const handleMemberChange = (e) => {
        const selectedName = e.target.value;
        setSelectedMemberName(selectedName);
        const selectedMember = generalMember.find(member => member.fullName === selectedName);
        if (selectedMember) {
            setSelectedMemberId(selectedMember.memberId);
            setSelectedMemberLibNo(selectedMember.libGenMembNo);
        } else {
            setSelectedMemberId('');
            setSelectedMemberLibNo('');
        }
    };

    const resetField = () => {
        setSelectedMemberName("");
        setSelectedMemberLibNo('');
        setFormData({
            invoiceNo: "",
            invoiceDate: formData.invoiceDate,
            feeType: "",
            bankName: "",
            chequeNo: "",
            chequeDate: "",
            monthlyDescription: "",
        });
    };

    //post api
    const handleAddSubmit = async () => {
        const formattedInvoiceDate = formatDate(formData.invoiceDate);
        const formattedChequeDate = formData.chequeDate ? formatDate(formData.chequeDate) : null;
        const totalFees = feesData.reduce((total, fee) => total + parseFloat(fee.feesAmount || 0), 0);
        const membershipFeesDetails = feesData.map(fee => ({
            feesIdF: fee.feesId,
            feesAmount: parseFloat(fee.feesAmount || 0)
        }));
        const payload = {
            memInvoiceNo: invoiceNumber,
            memInvoiceDate: formattedInvoiceDate,
            memberIdF: selectedMemberId,
            feesType: formData.feeType === "Cash" ? "A" : "B",
            bankName: formData.bankName,
            chequeNo: formData.chequeNo,
            chequeDate: formattedChequeDate,
            membershipDescription: formData.monthlyDescription,
            fess_total: totalFees,
            membershipFeesDetails
        };
        try {
            const response = await fetch(`${BaseURL}/api/membership-fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    toast.error(errorData.message || 'Member has already paid the membership fee');
                } else {
                    throw new Error(`Error submitting member fees: ${response.statusText}`);
                }
            } else {
                toast.success('Member fees added successfully!');
                setShowAddModal(false);
                resetField();
                fetchMemberData();
                fetchLatestNo();
            }
        } catch (error) {
            console.error(error);
            toast.error('Error submitting member fees. Please try again later.');
        }
    };


    //edit function
    //input change edit modal
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    //date format
    const parseDate = (date) => {
        if (!date) return '';
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    // Handle edit member change
    const handleEditMemberChange = (e) => {
        const selectedName = e.target.value;
        setEditData(prevState => ({
            ...prevState,
            selectedMemberName: selectedName
        }));
        const selectedMember = generalMember.find(member => member.fullName === selectedName);
        if (selectedMember) {
            setEditData(prevState => ({
                ...prevState,
                selectedMemberId: selectedMember.memberId
            }));
        } else {
            setEditData(prevState => ({
                ...prevState,
                selectedMemberId: ''
            }));
        }
    };

    //update edit api
    const handleEditClick = (item) => {
        const selectedMember = generalMember.find(member => member.memberId === item.memberIdF);
        const selectedMemberName = selectedMember ? selectedMember.fullName : '';
        setEditData({
            membershipId: item.membershipId,
            invoiceNo: item.memInvoiceNo,
            invoiceDate: parseDate(item.memInvoiceDate),
            selectedMemberName: selectedMemberName,
            selectedMemberId: item.memberIdF,
            feeType: item.feesType === "A" ? "Cash" : "Cheque",
            bankName: item.bankName,
            chequeNo: item.chequeNo,
            chequeDate: item.chequeDate ? parseDate(item.chequeDate) : '',
            monthlyDescription: item.membershipDescription
        });
        setShowEditModal(true);
    };
    const handleEditSubmit = async () => {
        const formattedInvoiceDate = formatDate(editData.invoiceDate);
        const formattedChequeDate = editData.chequeDate ? formatDate(editData.chequeDate) : null;
        const totalFees = feesData.reduce((total, fee) => total + parseFloat(fee.feesAmount || 0), 0);
        const membershipFeesDetails = feesData.map(fee => ({
            feesIdF: fee.feesId,
            feesAmount: parseFloat(fee.feesAmount || 0)
        }));
        const payload = {
            memInvoiceNo: editData.invoiceNo,
            memInvoiceDate: formattedInvoiceDate,
            memberIdF: editData.selectedMemberId,
            feesType: editData.feeType === "Cash" ? "A" : "B",
            bankName: editData.bankName,
            chequeNo: editData.chequeNo,
            chequeDate: formattedChequeDate,
            membershipDescription: editData.monthlyDescription,
            fess_total: totalFees,
            membershipFeesDetails
        };
        try {
            const response = await fetch(`${BaseURL}/api/membership-fees/${editData.membershipId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Error updating member fees: ${response.statusText}`);
            }
            toast.success('Member fees updated successfully!');
            setShowEditModal(false);
            fetchMemberData();
            fetchLatestNo();
        } catch (error) {
            console.error(error);
            toast.error('Error updating member fees. Please try again later.');
        }
    };

    //delete functuon
    const handleDeleteClick = (membershipId) => {
        setDeleteId(membershipId);
        setShowDeleteModal(true);
    };

    //delete api
    const handleDelete = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/membership-fees/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error deleting member fees: ${response.statusText}`);
            }
            toast.success('Member fees deleted successfully!');
            setShowDeleteModal(false);
            fetchMemberData();
            fetchLatestNo();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting member fees. Please try again later.');
        }
    };

    //view 
    const handleViewClick = (item) => {
        setViewData(item);
        setShowViewModal(true);
    };

    //pagination function
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(memberData.length / perPage);
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
    const currentData = memberData.slice(indexOfNumber, indexOfLastBookType);

    
    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div>
                    <div className='mt-3'>
                        <Button onClick={() => setShowAddModal(true)} className="button-color">
                            Add Member Fees
                        </Button>
                    </div>
                    <div className='table-responsive mt-3 table-height'>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Member Name</th>
                                    <th>Invoice No</th>
                                    <th>Invoice Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item, index) => (
                                    <tr key={item.membershipId}>
                                        <td>{indexOfNumber + index + 1}</td>
                                        <td>{item.fullName}</td>
                                        <td>{item.memInvoiceNo}</td>
                                        <td>{item.memInvoiceDate}</td>
                                        <td>
                                            <PencilSquare className="ms-3 action-icon edit-icon" onClick={() => handleEditClick(item)} />
                                            <Trash className="ms-3 action-icon view-icon" onClick={() => handleDeleteClick(item.membershipId)} />
                                            <Eye className="ms-3 action-icon view-icon" onClick={() => handleViewClick(item)} />
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

            <Modal centered show={showAddModal} onHide={() => { setShowAddModal(false); resetField() }} size='lg' >
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Membership Fees</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice No</Form.Label>
                                    <Form.Control
                                        placeholder="Invoice number"
                                        type="text"
                                        className="small-input"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="invoiceDate"
                                        value={formData.invoiceDate}
                                        onChange={handleInputChange}
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        list="memberName"
                                        className="small-input"
                                        value={selectedMemberName}
                                        onChange={handleMemberChange}
                                        placeholder="Select member name"
                                    />
                                    <datalist id="memberName">
                                        {generalMember.map(member => (
                                            <option key={member.memberId} value={member.fullName} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>LibGenMembNo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        readOnly
                                        value={selectedMemberLibNo}
                                    />
                                </Form.Group>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            {Object.keys(feesData[0] || {}).filter(key => key !== 'isBlock').map((key, index) => (
                                                <th key={index} className='sr-size'>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesData.map((fee, index) => (
                                            <tr key={fee.feesId}>
                                                {Object.entries(fee).filter(([key]) => key !== 'isBlock').map(([key, value], subIndex) => (
                                                    <td key={subIndex} className='sr-size'>{value}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td></td>
                                            <td className='sr-size' >Total</td>
                                            <td className='sr-size'>{feesData.reduce((total, fee) => total + parseFloat(fee.feesAmount || 0), 0)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Fee Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="feeType"
                                        className="small-input"
                                        value={formData.feeType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Fees Type</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                    </Form.Control>
                                </Form.Group>
                            </Row>
                            {formData.feeType === "Cheque" && (
                                <>
                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                name="bankName"
                                                type="text"
                                                value={formData.bankName}
                                                onChange={handleInputChange}
                                                placeholder='Bank Name'
                                                required
                                                className="small-input"
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Cheque No</Form.Label>
                                            <Form.Control
                                                name="chequeNo"
                                                type="text"
                                                value={formData.chequeNo}
                                                onChange={handleInputChange}
                                                placeholder='Cheque Number'
                                                required
                                                className="small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} lg={6}>
                                            <Form.Label>Cheque Date</Form.Label>
                                            <Form.Control
                                                name="chequeDate"
                                                type="date"
                                                value={formData.chequeDate}
                                                onChange={handleInputChange}
                                                required
                                                className="custom-date-picker small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                </>
                            )}

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        name="monthlyDescription"
                                        type="text"
                                        value={formData.monthlyDescription}
                                        onChange={handleInputChange}
                                        placeholder='Description'
                                        required
                                        className="small-input"
                                    />
                                </Form.Group>
                            </Row>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Close
                        </Button>
                        <Button className='button-color' onClick={handleAddSubmit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* edit modal */}
            <Modal centered show={showEditModal} onHide={() => { setShowEditModal(false); resetField() }} size='lg'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Membership Fees</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice No</Form.Label>
                                    <Form.Control
                                        placeholder="Invoice number"
                                        type="text"
                                        name="invoiceNo"
                                        className="small-input"
                                        value={editData.invoiceNo}
                                        onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="invoiceDate"
                                        value={editData.invoiceDate}
                                        onChange={handleEditInputChange}
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        list="editMemberName"
                                        className="small-input"
                                        value={editData.selectedMemberName}
                                        onChange={handleEditMemberChange}
                                        placeholder="Select member name"
                                    />
                                    <datalist id="editMemberName">
                                        {generalMember.map(member => (
                                            <option key={member.memberId} value={member.fullName} />
                                        ))}
                                    </datalist>
                                </Form.Group>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            {Object.keys(feesData[0] || {}).filter(key => key !== 'isBlock').map((key, index) => (
                                                <th key={index} className='sr-size'>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesData.map((fee, index) => (
                                            <tr key={fee.feesId}>
                                                {Object.entries(fee).filter(([key]) => key !== 'isBlock').map(([key, value], subIndex) => (
                                                    <td key={subIndex} className='sr-size'>{value}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr>
                                            <td></td>
                                            <td className='sr-size' >Total</td>
                                            <td className='sr-size'>{feesData.reduce((total, fee) => total + parseFloat(fee.feesAmount || 0), 0)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Fee Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="feeType"
                                        className="small-input"
                                        value={editData.feeType}
                                        onChange={handleEditInputChange}
                                        required
                                    >
                                        <option value="">Select Fees Type</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                    </Form.Control>
                                </Form.Group>
                            </Row>
                            {editData.feeType === "Cheque" && (
                                <>
                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                name="bankName"
                                                type="text"
                                                value={editData.bankName}
                                                onChange={handleEditInputChange}
                                                placeholder='Bank Name'
                                                required
                                                className="small-input"
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Cheque No</Form.Label>
                                            <Form.Control
                                                name="chequeNo"
                                                type="text"
                                                value={editData.chequeNo}
                                                onChange={handleEditInputChange}
                                                placeholder='Cheque Number'
                                                required
                                                className="small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} lg={6}>
                                            <Form.Label>Cheque Date</Form.Label>
                                            <Form.Control
                                                name="chequeDate"
                                                type="date"
                                                value={editData.chequeDate}
                                                onChange={handleEditInputChange}
                                                required
                                                className="custom-date-picker small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                </>
                            )}

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        name="monthlyDescription"
                                        type="text"
                                        value={editData.monthlyDescription}
                                        onChange={handleEditInputChange}
                                        placeholder='Description'
                                        required
                                        className="small-input"
                                    />
                                </Form.Group>
                            </Row>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleEditSubmit}>
                            Update
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* delete modal */}
            <Modal centered show={showDeleteModal} onHide={() => setShowDeleteModal(false)} >
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this membership fee?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            No
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Yes
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* view modal */}
            <Modal centered show={showViewModal} onHide={() => { setShowViewModal(false); resetField() }} size='lg' >
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>View Membership Fees</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice No</Form.Label>
                                    <Form.Control
                                        placeholder="Invoice number"
                                        type="text"
                                        value={viewData.memInvoiceNo}
                                        readOnly
                                        className="small-input"
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Invoice Date</Form.Label>
                                    <Form.Control
                                        value={viewData.memInvoiceDate}
                                        readOnly
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={generalMember.find(member => member.memberId === viewData.memberIdF)?.fullName || ""}
                                        readOnly
                                        className="small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            <th className='sr-size'>Fees ID</th>
                                            <th>Fees Name</th>
                                            <th>Fees Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesData.map((fee, index) => (
                                            <tr key={fee.feesId}>
                                                <td className='sr-size'>{fee.feesId}</td>
                                                <td className='sr-size'>{fee.feesName}</td>
                                                <td className='sr-size'>{fee.feesAmount}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td></td>
                                            <td className='sr-size'>Total</td>
                                            <td className='sr-size'>{feesData.reduce((total, fee) => total + parseFloat(fee.feesAmount || 0), 0)}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Fee Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewData.feesType === "A" ? "Cash" : "Cheque"}
                                        readOnly
                                        className="small-input"
                                    />
                                </Form.Group>
                            </Row>
                            {viewData.feesType === "B" && (
                                <>
                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={viewData.bankName}
                                                readOnly
                                                className="small-input"
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col}>
                                            <Form.Label>Cheque No</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={viewData.chequeNo}
                                                readOnly
                                                className="small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} lg={6}>
                                            <Form.Label>Cheque Date</Form.Label>
                                            <Form.Control
                                                value={viewData.chequeDate}
                                                readOnly
                                                className="custom-date-picker small-input"
                                            />
                                        </Form.Group>
                                    </Row>
                                </>
                            )}

                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={viewData.membershipDescription}
                                        readOnly
                                        className="small-input"
                                    />
                                </Form.Group>
                            </Row>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </div>
    );
};

export default MembershipFees;
