/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Table, Modal, Button, Form, Col, Row, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../Auth/AuthProvider';
import '../InventoryTransaction/CSS/Purchase.css';
import { Trash, Eye, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

// date format
const formatDateToDDMMYYYY = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};



const IssueReturn = () => {
    //get 
    const [issueReturn, setIssueReturn] = useState([]);
    //get general member
    const [generalMember, setGeneralMember] = useState([]);
    //post
    const [showAddModal, setShowAddModal] = useState(false);
    const [issueReturnNumber, setIssueReturnNumber] = useState('');
    const [issueReturnDate, setIssueReturnDate] = useState(new Date().toISOString().substr(0, 10));
    const [selectedMemberName, setSelectedMemberName] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [selectedMemberLibNo, setSelectedMemberLibNo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [rows, setRows] = useState(Array.from({ length: 5 }, () => ({
        bookId: '',
        bookdetailId: '',
        stockDetailId: '',
        bookName: '',
        accessionNo: '',
        invoiceDate: '',
        daysKept: 0,
        finePerDays: 0,
        fineDays: 0,
        fineAmount: 0,
        fineManuallyChanged: false
    })));
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    //delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [issueReturnIdToDelete, setIssueReturnIdToDelete] = useState(null);
    //view
    const [showViewModal, setShowViewModal] = useState(false);
    //session
    //start date and end date
    const [sessionStartDate, setSessionStartDate] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(formatDateToDDMMYYYY());
    //auth
    const navigate = useNavigate();
    const { username, accessToken, logout } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchSessionDate();
        fetchGeneralMembers();
        fetchLatestIssueReturnNo();
    }, [username, accessToken]);

    //session
    const fetchSessionDate = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/session/current-year-info`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching session date: ${response.statusText}`);
            }
            const data = await response.json();
            setSessionStartDate({
                sessionFromDt: data.sessionFromDt,
                currentDate: data.currentDate
            });
            setStartDate(formatDate(data.sessionFromDt));
            setEndDate(formatDate(new Date()));
            fetchStartDateEndDate(data.sessionFromDt, data.currentDate);
        } catch (error) {
            console.error('Error fetching session date:', error);
            toast.error('Error fetching session date. Please try again later.');
        }
    };

    //hit api for getting date in "session"  also hit api for select start and end dates
    const fetchStartDateEndDate = async (sessionFromDt, currentDate) => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/issueReturns?startDate=${sessionFromDt}&endDate=${currentDate}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                toast.info('No sessions found for the provided year range');
                logout();
                sessionStorage.clear();
                navigate('/');
                return;
            }
            const responseData = await response.json();
            if (responseData.success === false && responseData.statusCode === 400) {
                toast.info('No sessions found for the provided year range');
                logout();
                sessionStorage.clear();
                navigate('/');
                return;
            }
            const data = responseData.data;
            const updatedData = data.map(issueItem => ({
                ...issueItem,
                MemberFullName: `${issueItem.firstname} ${issueItem.middlename} ${issueItem.lastname}`
            }));
            // const sortedData = updatedData.sort((a, b) => a.MemberFullName.localeCompare(b.MemberFullName));
            setIssueReturn(updatedData || []);
        } catch (error) {
            console.error('Error fetching issues:', error);
            toast.error('Error fetching issues. Please try again later.');
            logout();
            sessionStorage.clear();
            navigate('/');
        }
    };

    //select start and end date
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
    };
    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
    };
    //search 
    const handleSearchClick = () => {
        const formattedStartDate = formatDateToDDMMYYYY(new Date(startDate));
        const formattedEndDate = formatDateToDDMMYYYY(new Date(endDate));
        fetchStartDateEndDate(formattedStartDate, formattedEndDate);
    };

    //get issue return number
    const fetchLatestIssueReturnNo = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/stock/latest-issueReturnNo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching latest issue return number: ${response.statusText}`);
            }
            const data = await response.json();
            setIssueReturnNumber(data.nextInvoiceNo);
        } catch (error) {
            console.error('Error fetching latest issue return number:', error);
            toast.error('Error fetching latest issue return number. Please try again later.');
        }
    };

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
            setGeneralMember(data.data);
        } catch (error) {
            console.error("Failed to fetch general members:", error);
            toast.error('Failed to load general members. Please try again later.');
        }
    };

    //issue return date select api hit and calculate amount
    const handleDateSelect = (e) => {
        const date = e.target.value;
        setIssueReturnDate(date);
        if (selectedMemberId && date) {
            fetchIssueReturnDetails(selectedMemberId, date);
        }
    };

    //member select
    const handleMemberSelect = (e) => {
        const fullName = e.target.value;
        setSelectedMemberName(fullName);
        const selectedMember = generalMember.find(member =>
            `${member.firstName} ${member.middleName} ${member.lastName}` === fullName
        );
        if (selectedMember) {
            setSelectedMemberId(selectedMember.memberId);
            setRows([]);
            setErrorMessage('');
            if (issueReturnDate) {
                fetchIssueReturnDetails(selectedMember.memberId, issueReturnDate);
            }
            setSelectedMemberLibNo(selectedMember.libGenMembNo);
        } else {
            setSelectedMemberId('');
            setRows([]);
            setErrorMessage('');
            setSelectedMemberLibNo('');
        }
    };

    // //date format for api
    // const formatDate = (date) => {
    //     if (!date) return '';
    //     const [year, month, day] = date.split('-');
    //     return `${day}-${month}-${year}`;
    // };

    //get all issue return details amount,book name,accession no,fine per amount etc
    const fetchIssueReturnDetails = async (memberId, date) => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/detail/${memberId}/${formatDateToDDMMYYYY(date)}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching issue details: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.length === 0) {
                setErrorMessage('This username has no issue details or does not exist.');
            } else {
                const bookRows = data.map(item => ({
                    bookId: item.bookId,
                    bookdetailId: item.bookdetailId,
                    stockDetailId: item.stockDetailId,
                    bookName: item.bookName,
                    accessionNo: item.accessionNo,
                    invoiceDate: item.invoiceDate,
                    daysKept: item.daysKept,
                    finePerDays: item.finePerDays,
                    fineDays: item.fineDays,
                    fineAmount: item.fineAmount,
                    fineManuallyChanged: false,
                }));
                setRows(bookRows);
            }
        } catch (error) {
            console.error('Error fetching issue details:', error.message);
            toast.error('Error fetching issue details. Please try again later.');
        }
    };

    //fine date change
    const handleFinePerDayChange = (index, value) => {
        setRows(prevRows =>
            prevRows.map((row, idx) =>
                idx === index ? { ...row, finePerDays: Number(value), fineManuallyChanged: false, fineAmount: Number(value) * row.fineDays } : row
            )
        );
    };
    //fine amount change
    const handleFineAmountChange = (index, value) => {
        setRows(prevRows =>
            prevRows.map((row, idx) =>
                idx === index ? { ...row, fineAmount: Number(value), fineManuallyChanged: true } : row
            )
        );
    };
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    //row select this send paylod
    const handleRowSelect = (row) => {
        setSelectedRows(prevSelectedRows =>
            prevSelectedRows.includes(row)
                ? prevSelectedRows.filter(r => r !== row)
                : [...prevSelectedRows, row]
        );
    };


    const calculateTotal = () => {
        return selectedRows.reduce((acc, current) => acc + current.fineAmount, 0);
    };

    const resetFormFields = () => {
        setRows(Array.from({ length: 5 }, () => ({
            bookId: '',
            bookdetailId: '',
            stockDetailId: '',
            bookName: '',
            accessionNo: '',
            invoiceDate: '',
            daysKept: 0,
            finePerDays: 0,
            fineDays: 0,
            fineAmount: 0,
            fineManuallyChanged: false
        })));
        setSelectedRows([]);
        setSelectedDetail(null);
        setSelectedMemberName('');
        setSelectedMemberLibNo('');
        setSelectedRowIndex(null);
    };

    //post api
    const handleSubmit = async (event) => {
        event.preventDefault();
        const selectedBookDetails = rows.filter(row => selectedRows.includes(row));
        const payload = {
            issueNo: issueReturnNumber,
            issueReturnDate: formatDateToDDMMYYYY(issueReturnDate),
            memberId: generalMember.find(member => member.memberId === parseInt(selectedMemberId))?.memberId,
            bookDetailsList: selectedBookDetails.map(row => ({
                bookDetailIds: row.bookdetailId,
                bookId: row.bookId,
                stockDetailId: row.stockDetailId,
                issuedate: (row.invoiceDate),
                fineDays: row.fineDays,
                finePerDays: row.finePerDays,
                fineAmount: row.fineManuallyChanged ? row.fineAmount : row.finePerDays * row.fineDays
            }))
        };
        if (selectedBookDetails.length === 0) {
            toast.error('No books selected.');
            return;
        }
        try {
            const response = await fetch(`${BaseURL}/api/issue/return/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                toast.success(data.message || 'Issue return submitted successfully.');
                setShowAddModal(false);
                resetFormFields();
                fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
                fetchLatestIssueReturnNo();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to submit issue return.');
            }
        } catch (error) {
            console.error('Error submitting issue return:', error);
            toast.error('Error submitting issue return. Please try again.');
        }
    };

    //delete function
    const handleDelete = (issueReturnId) => {
        setIssueReturnIdToDelete(issueReturnId);
        setShowDeleteModal(true);
    };

    //delete api
    const confirmDelete = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/${issueReturnIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                toast.success('Issue return deleted successfully.');
                fetchSessionDate();
                fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to delete issue return.');
            }
        } catch (error) {
            console.error('Error deleting issue return:', error);
            toast.error('Error deleting issue return. Please try again.');
        } finally {
            setShowDeleteModal(false);
        }
    };

    //view function
    const handleViewDetail = (detail) => {
        setSelectedDetail(detail);
        setShowViewModal(true);
    };
    //calculate total in view
    const calculateDetailTotal = () => {
        if (!selectedDetail) return 0;
        return selectedDetail.bookDetailsList.reduce((acc, current) => acc + current.fineAmount, 0);
    };

    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(issueReturn.length / perPage);
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
    const indexOfLastItem = currentPage * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    const currentData = issueReturn.slice(indexOfFirstItem, indexOfLastItem);


    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-2'>
                    <div className='mt-1 d-flex justify-content-between'>
                        <Button onClick={() => setShowAddModal(true)} className="button-color">
                            Add Book Issue Return
                        </Button>
                        <div className="d-flex">
                            <InputGroup className="ms-3">
                                <InputGroup.Text>Start Date</InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="custom-date-picker small-input border"
                                />
                            </InputGroup>
                            <InputGroup className="ms-3">
                                <InputGroup.Text>End Date</InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    className="custom-date-picker small-input border"
                                />
                            </InputGroup>
                            <Button onClick={handleSearchClick} className="button-color ms-3">
                                Search
                            </Button>
                        </div>
                    </div>
                    <div className="table-responsive table-height mt-4">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Member Name</th>
                                    <th>Issue Return No</th>
                                    <th>Issue Return Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((value, index) => (
                                    <tr key={value.stockId}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{value.MemberFullName}</td>
                                        <td>{value.invoiceNo}</td>
                                        <td>{value.invoiceDate}</td>
                                        <td>
                                            <Eye className="ms-3 action-icon view-icon" onClick={() => handleViewDetail(value)} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => handleDelete(value.stockId)} />
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

            <Modal centered show={showAddModal} onHide={() => { setShowAddModal(false); resetFormFields() }} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Issue Return</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Issue Return No</Form.Label>
                                    <Form.Control
                                        placeholder="Issue return number"
                                        type="text"
                                        className="small-input"
                                        value={issueReturnNumber}
                                        onChange={(e) => setIssueReturnNumber(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Issue Return Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={issueReturnDate}
                                        onChange={handleDateSelect}
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedMemberName}
                                        onChange={handleMemberSelect}
                                        list="memberNameList"
                                        placeholder="Enter or select a member"
                                    />
                                    <datalist id="memberNameList">
                                        {generalMember.map(member => (
                                            <option key={member.memberId} value={`${member.firstName} ${member.middleName} ${member.lastName}`}>
                                                {`${member.firstName} ${member.middleName} ${member.lastName}`}
                                            </option>
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
                                {errorMessage && (
                                    <div className="error-message text-danger mt-3">{errorMessage}</div>
                                )}
                            </Row>
                            <div className="table-responsive">
                                {errorMessage ? null : (
                                    <Table striped bordered hover className="table-bordered-dark">
                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Book Name</th>
                                                <th>Accession No</th>
                                                <th>Issue Date</th>
                                                <th>Fine Per Day</th>
                                                <th>Total Day</th>
                                                <th>Extra Day</th>
                                                <th>Fine Amount</th>
                                                <th>Select Issue Return</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{row.bookName}</td>
                                                    <td>{row.accessionNo}</td>
                                                    <td>{row.invoiceDate}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={row.finePerDays}
                                                            onChange={(e) => handleFinePerDayChange(index, e.target.value)}
                                                            style={{ width: '60px' }}
                                                            onFocus={() => setSelectedRowIndex(index)}
                                                        />
                                                    </td>
                                                    <td>{row.daysKept}</td>
                                                    <td>{row.fineDays}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            style={{ width: '80px' }}
                                                            className="form-control form-control-sm"
                                                            value={row.fineAmount.toFixed(2)}
                                                            onChange={(e) => handleFineAmountChange(index, e.target.value)}
                                                            onFocus={() => setSelectedRowIndex(index)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(row)}
                                                                onChange={() => handleRowSelect(row)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td>Total</td>
                                                <td>{calculateTotal().toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                )}
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            <Modal centered show={showDeleteModal} onHide={() => { setShowDeleteModal(false); resetFormFields() }}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this issue return?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        No
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal centered show={showViewModal} onHide={() => setShowViewModal(false)} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Issue Return Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDetail && (
                        <>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Issue Return No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="small-input"
                                        value={selectedDetail.invoiceNo}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Issue Return Date</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedDetail.invoiceDate}
                                        readOnly
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Member Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedDetail.MemberFullName}
                                        readOnly
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            <th className='sr-size'>Sr. No.</th>
                                            <th>Book Name</th>
                                            <th>Accession No</th>
                                            <th>Issue Date</th>
                                            <th>Fine Per Day</th>
                                            <th>Fine Days</th>
                                            <th>Fine Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDetail.bookDetailsList.map((detail, index) => (
                                            <tr key={index}>
                                                <td className='sr-size'>{index + 1}</td>
                                                <td>{detail.BookName}</td>
                                                <td>{detail.AcessionNo}</td>
                                                <td>{detail.issuedate}</td>
                                                <td>{detail.finePerDays}</td>
                                                <td>{detail.fineDays}</td>
                                                <td>{detail.fineAmount}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>Total</td>
                                            <td>{calculateDetailTotal()}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IssueReturn;
