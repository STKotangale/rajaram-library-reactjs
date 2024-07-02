/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Table, Modal, Button, Form, Col, Row, InputGroup } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Eye, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useAuth } from '../../Auth/AuthProvider';
import '../InventoryTransaction/CSS/Purchase.css';
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


const BookIssue = () => {
    //get all issue
    const [issue, setIssue] = useState([]);
    //get general member
    const [generalMember, setGeneralMember] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    //get book details in copy no only updated (updated book details)
    const [bookDetails, setBookDetails] = useState([]);
    //get member name for online booking data
    const [memberBookings, setMemberBookings] = useState([]);
    //post
    const [showAddModal, setShowAddModal] = useState(false);
    const [rows, setRows] = useState(Array.from({ length: 5 }, () => ({ bookId: '', bookName: '', accessionNo: '' })));
    const [issueNumber, setIssueNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().substr(0, 10));
    const [selectedMemberName, setSelectedMemberName] = useState('');
    const [selectedMemberLibNo, setSelectedMemberLibNo] = useState('');
    //check membership 
    const [isMembershipValid, setIsMembershipValid] = useState(false);
    const [membershipChecked, setMembershipChecked] = useState(false);
    //show error message
    const [errorMessage, setErrorMessage] = useState('');
    //all book details combine
    const [allBookDetails, setAllBookDetails] = useState([]);
    //delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [issueToDelete, setIssueToDelete] = useState(null);
    //get view data
    const [viewDetails, setViewDetails] = useState(null);
    //view
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    //start date and end date
    const [sessionStartDate, setSessionStartDate] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(formatDateToDDMMYYYY());
    //auth
    const navigate = useNavigate();
    const { username, accessToken, logout } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        // fetchIssue();
        fetchGeneralMembers();
        fetchBookDetails();
        fetchLatestIssueNo();
        fetchSessionDate();
    }, [username, accessToken]);


    //get session dates
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
            const response = await fetch(`${BaseURL}/api/issue/all?startDate=${sessionFromDt}&endDate=${currentDate}`, {
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
                fullName: `${issueItem.firstName} ${issueItem.middleName} ${issueItem.lastName}`
            }));
            const sortedData = updatedData.sort((a, b) => a.fullName.localeCompare(b.fullName));
            setIssue(sortedData || []);
        } catch (error) {
            console.error('Error fetching issues:', error);
            toast.error('Error fetching issues. Please try again later.');
            logout();
            sessionStorage.clear();
            navigate('/');
        }
    };

    //select start and end dates
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

    //get Issue  No number
    const fetchLatestIssueNo = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/stock/latest-issueNo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching latest issue  number: ${response.statusText}`);
            }
            const data = await response.json();
            setIssueNumber(data.nextInvoiceNo);
        } catch (error) {
            console.error('Error fetching latest issue  number:', error);
            toast.error('Error fetching latest issue  number. Please try again later.');
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
            setGeneralMember(data.data.map(member => ({
                ...member,
                fullName: `${member.firstName} ${member.middleName} ${member.lastName}`
            })));
        } catch (error) {
            console.error("Failed to fetch general members:", error);
            toast.error('Failed to load general members. Please try again later.');
        }
    };

    //get book details is updated with accession number
    const fetchBookDetails = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/bookdetails/copyno`);
            if (!response.ok) {
                throw new Error(`Error fetching book details: ${response.statusText}`);
            }
            const data = await response.json();
            setBookDetails(data);
        } catch (error) {
            console.error('Error fetching book details:', error.message);
            toast.error('Error fetching book details. Please try again later.');
        }
    };

    //online booking with accession number or without accession number 
    const fetchBookingDetails = async (memberId) => {
        try {
            const response = await fetch(`${BaseURL}/api/member-bookings/bookings/${memberId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching bookings: ${response.statusText}`);
            }
            const data = await response.json();
            setMemberBookings(data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            toast.error('Failed to load booking details. Please try again later.');
        }
    };

    useEffect(() => {
        const combinedBooks = [...new Map(bookDetails.map(book => [book.bookId, book]).concat(
            memberBookings.map(booking => [booking.book_idF, {
                bookId: booking.book_idF,
                bookName: booking.bookName
            }])
        )).values()];
        setAllBookDetails(combinedBooks);
    }, [bookDetails, memberBookings]);


    //date change for add modal
    const handleDateChange = async (e) => {
        const newDate = e.target.value;
        setIssueDate(newDate);
        if (selectedMemberId && newDate) {
            const membershipCheck = await checkMembershipFees(selectedMemberId, newDate);
            if (membershipCheck && membershipCheck.success) {
                setIsMembershipValid(true);
                setMembershipChecked(true);
            } else {
                setIsMembershipValid(false);
                setMembershipChecked(false);
                setErrorMessage("Member not registered or membership fees unpaid. Please register or pay dues to borrow books.");
            }
        }
    };

    //member change
    const handleMemberChange = async (e) => {
        const fullName = e.target.value;
        setSelectedMemberName(fullName);

        const selectedMember = generalMember.find(member => member.fullName === fullName);
        if (selectedMember) {
            setSelectedMemberId(selectedMember.memberId);
            setSelectedMemberLibNo(selectedMember.libGenMembNo);
            if (issueDate) {
                const membershipCheck = await checkMembershipFees(selectedMember.memberId, issueDate);
                if (membershipCheck && membershipCheck.success) {
                    setIsMembershipValid(true);
                    setMembershipChecked(true);
                } else {
                    setIsMembershipValid(false);
                    setMembershipChecked(false);
                    setErrorMessage("Error: Member not registered or membership fees unpaid. Please register or pay dues to borrow books.");
                }
            }
            fetchBookingDetails(selectedMember.memberId);
        } else {
            setSelectedMemberId('');
            setSelectedMemberLibNo('');
        }
    };

    //date format
    const formatDateForPayload = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    //get and valid membership check
    const checkMembershipFees = async (memberId, date) => {
        try {
            const formattedDate = formatDateForPayload(date);

            const response = await fetch(`${BaseURL}/api/membership-fees/check-member-fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ memberId, date: formattedDate })
            });

            if (!response.ok) {
                throw new Error(`Error ... ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    //accession no change and update book name auto
    const handleAccessionInputChange = (index, event) => {
        const updatedRows = [...rows];
        const accessionNo = event.target.value;
        const matchingBook = bookDetails.find(book =>
            book.copyDetails.some(detail => detail.accessionNo === accessionNo)
        );
        if (matchingBook) {
            const matchingDetail = matchingBook.copyDetails.find(detail => detail.accessionNo === accessionNo);
            updatedRows[index] = {
                accessionNo: accessionNo,
                bookId: matchingBook.bookId,
                bookName: matchingBook.bookName,
                bookDetailId: matchingDetail.bookDetailId
            };
        } else {
            updatedRows[index] = {
                accessionNo: accessionNo,
                bookId: '',
                bookName: '',
                bookDetailId: ''
            };
        }
        setRows(updatedRows);
    };

    const addRowAdd = () => {
        setRows([...rows, { bookId: '', bookName: '', accessionNo: '' }]);
    };

    const deleteRowAdd = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };

    const resetFormFields = () => {
        setSelectedMemberName('');
        setSelectedMemberLibNo('');
        setRows(Array.from({ length: 5 }, () => ({ bookId: '', bookName: '', accessionNo: '' })));
        setIsMembershipValid(false);
        setMembershipChecked(false);
        setErrorMessage('');
        setMemberBookings([]);
    };

    //post
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedMemberName) {
            toast.error("Please select a member name.");
            return;
        }
        const invalidEntries = rows.filter(row => row.bookId && !row.accessionNo);
        if (invalidEntries.length > 0) {
            invalidEntries.forEach(row => {
                const bookName = allBookDetails.find(book => book.bookId === Number(row.bookId))?.bookName;
                toast.error(`Please select an accession number for the book "${bookName}".`);
            });
            return;
        }
        if (!isMembershipValid) {
            return;
        }
        const bookDetailsPayload = rows
            .filter(row => row.bookId && row.accessionNo)
            .map(row => ({
                bookId: Number(row.bookId),
                bookdetailId: Number(row.bookDetailId)
            }));
        const formattedDate = formatDateForPayload(issueDate);
        const payload = {
            invoiceNo: issueNumber,
            invoiceDate: formattedDate,
            generalMemberId: selectedMemberId,
            bookDetails: bookDetailsPayload,
        };
        try {
            const response = await fetch(`${BaseURL}/api/issue/book-issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const purchaseDetails = await response.json();
                toast.success(purchaseDetails.message);
                const membOnlineIds = rows
                    .filter(row => row.bookId && row.accessionNo)
                    .map(row => {
                        const matchedBooking = memberBookings.find(booking => booking.book_idF === Number(row.bookId));
                        return matchedBooking ? matchedBooking.membOnlineId : null;
                    })
                    .filter(id => id !== null);
                await updateBlockStatus(membOnlineIds);
                setShowAddModal(false);
                resetFormFields();
                fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
                fetchBookDetails();//copyno
                fetchLatestIssueNo();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message);
            }
        } catch (error) {
            console.error('Error submitting issue:', error);
            toast.error('Error submitting issue. Please try again.');
        }
    };

    // update api block status change
    const updateBlockStatus = async (membOnlineIds) => {
        try {
            const response = await fetch(`${BaseURL}/api/member-bookings/update-block-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ membOnlineIds })
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(`Error updating block status: ${errorData.message}`);
            } else {
                // toast.success('Block status updated successfully.');
            }
        } catch (error) {
            console.error('Error updating block status:', error);
            // toast.error('Error updating block status. Please try again.');
        }
    };

    //delete function
    const handleDeleteClick = (issue) => {
        setIssueToDelete(issue);
        setShowDeleteModal(true);
    };

    //delete api
    const handleDeleteConfirm = async () => {
        if (!issueToDelete) return;
        try {
            const response = await fetch(`${BaseURL}/api/issue/book-issue/${issueToDelete.stock_id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch issue details');
            }
            const issueDetails = await response.json();
            const bookDetailIds = issueDetails[0].books.map(book => book.bookDetailId);
            const updateResponse = await fetch(`${BaseURL}/api/bookdetails/update-status-issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(bookDetailIds)
            });
            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                toast.error(`Error updating book details status: ${errorData.message}`);
                return;
            }
            const deleteResponse = await fetch(`${BaseURL}/api/issue/${issueToDelete.stock_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (deleteResponse.ok) {
                toast.success('Issue deleted successfully.');
                setShowDeleteModal(false);
                fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
                fetchBookDetails();//copyno
                fetchLatestIssueNo();
            } else {
                const errorData = await deleteResponse.json();
                toast.error(errorData.message);
            }
        } catch (error) {
            console.error('Error deleting issue:', error);
            toast.error('Error deleting issue. Please try again.');
        }
    };

    // View purchase
    const fetchViewDetails = async (stockId) => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/book-issue/${stockId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch issue details');
            }
            const data = await response.json();
            // setViewDetails(data[0]);
            const updatedData = {
                ...data[0],
                fullName: `${data[0].firstName} ${data[0].middleName} ${data[0].lastName}`
            };
            setViewDetails(updatedData);
        } catch (error) {
            console.error(error);
        }
    };

    //view
    const handleViewClick = (issue) => {
        setSelectedIssue(issue);
        fetchViewDetails(issue.stock_id);
        setShowViewModal(true);
    };

    //pagination function
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(issue.length / perPage);
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
    const currentData = issue.slice(indexOfNumber, indexOfLastBookType);


    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-2'>
                    <div className='mt-1 d-flex justify-content-between'>
                        <Button onClick={() => setShowAddModal(true)} className="button-color">
                            Add Book Issue
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
                                    <th>Issue No</th>
                                    <th>Issue Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((issueItem, index) => (
                                    <tr key={issueItem.stock_id}>
                                        <td>{index + 1}</td>
                                        <td>{issueItem.fullName}</td>
                                        <td>{issueItem.invoiceNo}</td>
                                        <td>{issueItem.invoiceDate}</td>
                                        <td>
                                            <Eye className="action-icon view-icon" onClick={() => handleViewClick(issueItem)} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => handleDeleteClick(issueItem)} />
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

            {/* add modal */}
            <Modal centered show={showAddModal} onHide={() => { setShowAddModal(false); resetFormFields() }} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Book Issue</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Issue No</Form.Label>
                                    <Form.Control
                                        placeholder="Issue number"
                                        type="text"
                                        className="small-input"
                                        value={issueNumber}
                                        onChange={(e) => setIssueNumber(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Issue Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={issueDate}
                                        onChange={handleDateChange}
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
                            <div className='error-message'>
                                {!membershipChecked && errorMessage && (
                                    <div className="error-message text-danger mt-3">{errorMessage}</div>
                                )}
                            </div>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            <th className='sr-size'>Sr. No.</th>
                                            <th>Accession No</th>
                                            <th>Book Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className='sr-size'>{index + 1}</td>
                                                <td>
                                                    <Form.Control
                                                        list={bookDetails.length > 0 ? `accessionNumbers-${index}` : undefined}
                                                        value={row.accessionNo}
                                                        onChange={(e) => handleAccessionInputChange(index, e)}
                                                        placeholder={bookDetails.length > 0 ? "Enter or Select Accession Number" : "No Accession Numbers Available"}
                                                    />
                                                    {bookDetails.length > 0 && (
                                                        <datalist id={`accessionNumbers-${index}`}>
                                                            {bookDetails.flatMap(book =>
                                                                book.copyDetails.map(detail => (
                                                                    <option key={detail.bookDetailId} value={detail.accessionNo} />
                                                                ))
                                                            )}
                                                        </datalist>
                                                    )}
                                                </td>
                                                <td>
                                                    <Form.Group as={Col}>
                                                        <Form.Control
                                                            type="text"
                                                            value={row.bookName}
                                                            readOnly
                                                        />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Trash className="ms-3 action-icon delete-icon" onClick={() => deleteRowAdd(index)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <Button onClick={addRowAdd} className="button-color">
                                    Add Book
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Close
                        </Button>
                        <Button className='button-color' onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* view modal */}
            <Modal centered show={showViewModal} onHide={() => setShowViewModal(false)} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>View Issue</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {viewDetails && (
                            <Form>
                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label>Issue No</Form.Label>
                                        <Form.Control
                                            placeholder="Issue number"
                                            type="text"
                                            className="small-input"
                                            value={viewDetails.invoiceNo}
                                            disabled
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col}>
                                        <Form.Label>Issue Date</Form.Label>
                                        <Form.Control
                                            value={viewDetails.invoiceDate}
                                            className="custom-date-picker small-input"
                                            disabled
                                        />
                                    </Form.Group>
                                </Row>

                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label>Member Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="small-input"
                                            value={viewDetails.fullName}
                                            disabled
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewDetails.books.map((detail, index) => (
                                                <tr key={index}>
                                                    <td className='sr-size'>{index + 1}</td>
                                                    <td>
                                                        <Form.Group as={Col}>
                                                            <Form.Control
                                                                type="text"
                                                                value={detail.bookName}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={detail.accessionNo}
                                                            disabled
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* delete modal */}
            <Modal centered show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this issue?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            No
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            Yes
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>
        </div>
    );
};

export default BookIssue;
