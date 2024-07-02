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


const PurchaseReturn = () => {
    //get all
    const [purchaseReturn, setPurchaseReturn] = useState([]);
    // post
    const [showAddModal, setShowAddModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substr(0, 10));
    const [purchaserName, setPurchaserName] = useState([]);
    const [selectedPurchaserName, setSelectedPurchaserName] = useState('');
    const [selectedPurchaserId, setSelectedPurchaserId] = useState(null);
    const [rows, setRows] = useState(Array.from({ length: 5 }, () => ({ bookId: '', bookName: '', purchaseCopyNo: '', amount: '', details: [] })));
    const [accessionDetails, setAccessionDetails] = useState([]);
    const [discountPercent, setDiscountPercent] = useState('');
    const [gstPercent, setGstPercent] = useState('');
    //delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStockId, setDeleteStockId] = useState(null);
    //view
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRowDetails, setSelectedRowDetails] = useState(null);
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
        fetchPurchaserName();
        fetchAccessionDetails();
        fetchLatestPurchaseReturnNo();
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

    //get data purchase return 
    const fetchStartDateEndDate = async (sessionFromDt, currentDate) => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/purchase-return-all?startDate=${sessionFromDt}&endDate=${currentDate}`, {
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
            // const sortedData = data.sort((a, b) => a.ledgerName.localeCompare(b.ledgerName));
            setPurchaseReturn(data || []);
        } catch (error) {
            console.error('Error fetching purchase returns:', error);
            toast.info('No sessions found for the provided year range');
            logout();
            sessionStorage.clear();
            navigate('/');
        }
    };

    //change start and end date 
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

    //get \purchase return number
    const fetchLatestPurchaseReturnNo = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/stock/latest-purchaseReturnNo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching latest purchase return number: ${response.statusText}`);
            }
            const data = await response.json();
            setInvoiceNumber(data.nextInvoiceNo);
        } catch (error) {
            console.error('Error fetching latest purchase return number:', error);
            toast.error('Error fetching latest purchase return number. Please try again later.');
        }
    };

    //purchase name
    const fetchPurchaserName = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/ledger`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setPurchaserName(data.data);
        } catch (error) {
            console.error("Failed to fetch purchaser:", error);
            toast.error('Failed to load purchaser. Please try again later.');
        }
    };


    //get accession details
    const fetchAccessionDetails = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/issue/acession-details`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching accession details: ${response.statusText}`);
            }
            const data = await response.json();
            setAccessionDetails(data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching accession details. Please try again later.');
        }
    };

    //purchase select
    const handlePurchaserSelect = (event) => {
        const selectedName = event.target.value;
        const purchaser = purchaserName.find(p => p.ledgerName === selectedName);
        if (purchaser) {
            setSelectedPurchaserName(purchaser.ledgerName);
            setSelectedPurchaserId(purchaser.ledgerID);
        } else {
            setSelectedPurchaserName('');
            setSelectedPurchaserId(null);
        }
    };

    //add and delete row in add modal
    const addRowAdd = () => {
        setRows([...rows, { bookId: '', bookName: '', purchaseCopyNo: '', amount: '', details: [] }]);
    };
    const deleteRowAdd = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };

    //calcutations
    const calculateBillTotal = () => {
        return rows.reduce((total, row) => total + (parseFloat(row.amount) || 0), 0).toFixed(2);
    };
    const calculateTotalAfterDiscount = (total) => {
        const discountValue = parseFloat(discountPercent) || 0;
        return (total - (total * (discountValue / 100))).toFixed(2);
    };
    const calculateTotalAfterGst = (total) => {
        const gstValue = parseFloat(gstPercent) || 0;
        return (total + (total * (gstValue / 100))).toFixed(2);
    };

    //accession change
    const handleAccessionInputChange = (index, event) => {
        const updatedRows = [...rows];
        const accessionNo = event.target.value;
        const matchingBook = accessionDetails.find(detail => detail.accessionNo === accessionNo);
        if (matchingBook) {
            updatedRows[index] = {
                ...updatedRows[index],
                purchaseCopyNo: accessionNo,
                bookName: matchingBook.bookName,
                bookDetailId: matchingBook.bookDetailId,
                amount: matchingBook.book_rate ? parseFloat(matchingBook.book_rate).toFixed(2) : ''
            };
        } else {
            updatedRows[index] = {
                ...updatedRows[index],
                purchaseCopyNo: accessionNo,
                bookName: '',
                bookDetailId: '',
                amount: ''
            };
        }
        setRows(updatedRows);
    };

    const resetFormFields = () => {
        setSelectedPurchaserName('');
        setDiscountPercent('');
        setGstPercent('');
        setRows(Array.from({ length: 5 }, () => ({ bookId: '', bookName: '', purchaseCopyNo: '', amount: '', details: [] })));
    };

    //post api
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!invoiceNumber || !invoiceDate || !selectedPurchaserId || rows.filter(row => row.bookName && row.purchaseCopyNo).length === 0) {
            toast.error('Please fill all required fields and add at least one book.');
            return;
        }
        const formattedFromDate = formatDateToDDMMYYYY(invoiceDate);
        const bookDetailsPayload = rows
            .filter(row => row.bookName && row.purchaseCopyNo)
            .map(row => ({
                bookdetailId: row.bookDetailId,
                amount: parseFloat(row.amount)
            }));
        const billTotal = parseFloat(calculateBillTotal());
        const totalAfterDiscount = parseFloat(calculateTotalAfterDiscount(billTotal));
        const grandTotal = parseFloat(calculateTotalAfterGst(totalAfterDiscount));
        const payload = {
            invoiceNO: invoiceNumber,
            invoiceDate: formattedFromDate,
            ledgerId: Number(selectedPurchaserId),
            billTotal: billTotal,
            grandTotal: grandTotal,
            discountPercent: parseFloat(discountPercent) || 0,
            discountAmount: calculateDiscountAmount(),
            totalAfterDiscount: totalAfterDiscount,
            bookDetails: bookDetailsPayload
        };
        try {
            const response = await fetch(`${BaseURL}/api/issue/purchase-return`, {
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
                setShowAddModal(false);
                resetFormFields();
                fetchSessionDate();
                fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
                fetchLatestPurchaseReturnNo();
                fetchAccessionDetails();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message);
            }
        } catch (error) {
            console.error('Error submitting purchase return:', error);
            toast.error('Error submitting purchase return. Please try again.');
        }
    };

    //calculations
    const billTotal = parseFloat(calculateBillTotal());
    const totalAfterDiscount = parseFloat(calculateTotalAfterDiscount(billTotal));
    const grandTotal = Math.floor(parseFloat(calculateTotalAfterGst(totalAfterDiscount)));
    const calculateDiscountAmount = () => {
        const billTotal = calculateBillTotal();
        const discountAmount = billTotal * (discountPercent / 100);
        // return Math.floor(discountAmount);
        return parseFloat(discountAmount.toFixed(2));
    };


    //delete function
    const handleDelete = (stockId) => {
        setDeleteStockId(stockId);
        setShowDeleteModal(true);
    };

    //delete api
    const confirmDelete = async () => {
        if (!deleteStockId) return;
        const selectedGroup = purchaseReturn.find(item => item.stockId === deleteStockId);
        if (!selectedGroup) {
            toast.error('No book details found for this stock.');
            return;
        }
        const bookDetailIds = selectedGroup.books.map(item => item.stockDetailId);
        try {
            const postResponse = await fetch(`${BaseURL}/api/bookdetails/update-status-purchase-return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(bookDetailIds)
            });
            if (!postResponse.ok) {
                const postData = await postResponse.json();
                toast.error(`Error during pre-deletion process: ${postData.message}`);
                return;
            }
            const deleteResponse = await fetch(`${BaseURL}/api/issue/${deleteStockId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!deleteResponse.ok) {
                const deleteData = await deleteResponse.json();
                toast.error(`Error deleting purchase return: ${deleteData.message}`);
                return;
            }
            toast.success('Purchase return successfully deleted.');
            setShowDeleteModal(false);
            fetchSessionDate();
            fetchStartDateEndDate(sessionStartDate.sessionFromDt, sessionStartDate.currentDate);
            fetchLatestPurchaseReturnNo();
            fetchAccessionDetails();
        } catch (error) {
            console.error('Error during the deletion process:', error);
            toast.error('Error during deletion process. Please try again.');
        }
    };

    //view
    const handleViewDetails = (item) => {
        setSelectedRowDetails(item);
        setShowDetailsModal(true);
    };

    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;
    const totalPages = Math.ceil(purchaseReturn.length / perPage);
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
    const currentData = purchaseReturn.slice(indexOfFirstItem, indexOfLastItem);


    return (
        <div className="main-content">
            <Container className='small-screen-table'>
                <div className='mt-2'>
                    <div className='mt-1 d-flex justify-content-between'>
                        <Button onClick={() => setShowAddModal(true)} className="button-color">
                            Add Purchase Return
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
                                    min={startDate} 
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
                                    <th>Purchaser Name</th>
                                    <th>Purchase Return No</th>
                                    <th>Purchase Return Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item, index) => (
                                    <tr key={item.stockId || index}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{item.ledgerName}</td>
                                        <td>{item.invoiceNo}</td>
                                        <td>{item.invoiceDate}</td>
                                        <td>
                                            <Eye className="ms-3 action-icon view-icon" onClick={() => handleViewDetails(item)} />
                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => handleDelete(item.stockId)} />
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
            <Modal centered show={showAddModal} onHide={() => { setShowAddModal(false); resetFormFields(); }} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Purchase Return</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col}>
                                    <Form.Label>Purchase Return No.</Form.Label>
                                    <Form.Control
                                        placeholder="Purchase return number"
                                        type="text"
                                        className="small-input"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>Purchase Return Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        className="custom-date-picker small-input"
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Label>Purchaser Name</Form.Label>
                                <Form.Control
                                    as="input"
                                    list="purchaserNames"
                                    value={selectedPurchaserName}
                                    onChange={handlePurchaserSelect}
                                    placeholder="Enter or select a purchaser"
                                />
                                <datalist id="purchaserNames">
                                    {purchaserName.map(purchaser => (
                                        <option key={purchaser.ledgerID} value={purchaser.ledgerName} />
                                    ))}
                                </datalist>
                            </Row>
                            <div className="table-responsive">
                                <Table striped bordered hover className="table-bordered-dark">
                                    <thead>
                                        <tr>
                                            <th className='sr-size'>Sr. No.</th>
                                            <th className="table-header purchase-copy-size">Accession No.</th>
                                            <th>Book Name</th>
                                            <th className="table-header amount-size amount-align">Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className='sr-size'>{index + 1}</td>
                                                <td>
                                                    <Form.Control
                                                        list={`accessionNumbers-${index}`}
                                                        value={row.purchaseCopyNo}
                                                        onChange={(e) => handleAccessionInputChange(index, e)}
                                                        placeholder="Enter or Select Accession Number"
                                                    />
                                                    <datalist id={`accessionNumbers-${index}`}>
                                                        {Array.isArray(accessionDetails) && accessionDetails.map(detail => (
                                                            <option key={detail.bookDetailId} value={detail.accessionNo} />
                                                        ))}
                                                    </datalist>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        value={row.bookName}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        value={row.amount ? row.amount : '0.00'}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>
                                                    <Trash className="ms-3 action-icon delete-icon" onClick={() => deleteRowAdd(index)} />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td></td>
                                            <td>
                                                <Button onClick={addRowAdd} className="button-color">
                                                    Add Book
                                                </Button>
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td className="right-align">Bill Total</td>
                                            <td className="amount-align">{billTotal.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td className="right-align">Discount</td>
                                            <td>
                                                <div className="input-with-suffix">
                                                    <Form.Control
                                                        className="right-align"
                                                        type="number"
                                                        placeholder="Discount"
                                                        value={discountPercent}
                                                        onChange={(e) => setDiscountPercent(e.target.value)}
                                                    />
                                                    <span>%</span>
                                                </div>
                                            </td>
                                            <td className="amount-align">{calculateDiscountAmount()}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td className="right-align">Total After Discount</td>
                                            <td className="amount-align">{totalAfterDiscount.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td className="right-align">Grand Total</td>
                                            <td className="amount-align">{grandTotal}</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </Table>
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
            <Modal centered show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size='xl'>
                <div className="bg-light">
                    <Modal.Header closeButton>
                        <Modal.Title>Purchase Return Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedRowDetails && (
                            <>
                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label>Purchase Return No.</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="small-input"
                                            value={selectedRowDetails.invoiceNo}
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col}>
                                        <Form.Label>Purchase Return Date</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedRowDetails.invoiceDate}
                                            className="small-input"
                                            readOnly
                                        />
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col}>
                                        <Form.Label>Purchaser Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="small-input"
                                            value={selectedRowDetails.ledgerName}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Row>
                                <div className="table-responsive">
                                    <Table striped bordered hover className="table-bordered-dark">
                                        <thead>
                                            <tr>
                                                <th className='sr-size'>Sr. No.</th>
                                                <th>Book Name</th>
                                                <th className="table-header purchase-copy-size">Accession No.</th>
                                                <th className="table-header amount-size amount-align">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRowDetails.books.map((row, index) => (
                                                <tr key={index}>
                                                    <td className='sr-size'>{index + 1}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            className="small-input"
                                                            value={row.bookName}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            className="small-input"
                                                            value={row.accessionNo}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={row.book_amount}
                                                            readOnly
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td className="right-align">Bill Total</td>
                                                <td className="amount-align">{selectedRowDetails.billTotal}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="right-align">Discount</td>
                                                <td>
                                                    <div className="input-with-suffix">
                                                        <Form.Control
                                                            className="right-align"
                                                            type="number"
                                                            value={selectedRowDetails.discountPercent}
                                                            readOnly
                                                        />
                                                        <span>%</span>
                                                    </div>
                                                </td>
                                                <td className="amount-align">{selectedRowDetails.discountAmount}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="right-align">Total After Discount</td>
                                                <td></td>
                                                <td className="amount-align">{selectedRowDetails.totalAfterDiscount}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="right-align">Grand Total</td>
                                                <td></td>
                                                <td className="amount-align">{Math.round(selectedRowDetails.grandTotal)}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* delete modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this purchase return?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
                    <Button variant="danger" onClick={confirmDelete}>Yes</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default PurchaseReturn;
