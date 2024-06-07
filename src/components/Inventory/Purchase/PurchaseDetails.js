/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { ArrowReturnLeft, Trash } from 'react-bootstrap-icons';

import { useAuth } from '../../Auth/AuthProvider';
import '../InventoryCSS/PurchaseBookDashboardData.css'

const PurchaseDetails = ({ handlePurchaseSubmit, onBackButtonClick }) => {

    const [rows, setRows] = useState(Array.from({ length: 5 }, () => ({ bookName: '', quantity: '', rate: '', amount: '' })));
    //discount
    const [discountPercentage, setDiscountPercentage] = useState("");
    //gst
    const [gstPercentage, setGstPercentage] = useState("");
    // date function 
    const [invoiceDate, setInvoiceDate] = useState();
    //invoice number
    const [invoiceNumber, setInvoiceNumber] = useState();
    // const [invoiceNumber, setInvoiceNumber] = useState(() => {
    //     return sessionStorage.getItem('invoiceNumber') || 'TIN1';
    // });

    // search Function 
    const [searchQuery] = useState('');
    //get ledger name
    const [ledgerName, setLedgerName] = useState([]);
    const [selectedLedgerName, setSelectedLedgerName] = useState("");
    const [selectedLedgerID, setSelectedLedgerID] = useState('');
    //get books name
    const [bookName, setBookName] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);

    //auth
    const { username, accessToken } = useAuth();
    const BaseURL = process.env.REACT_APP_BASE_URL;

    //get username and access token
    useEffect(() => {

    }, [username, accessToken]);

    // useEffect(() => {
    // sessionStorage.setItem('invoiceNumber', invoiceNumber);
    // }, [invoiceNumber]);

    //get 
    const [purchases, setPurchases] = useState([]);
    //get purchase
    const fetchPurchases = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/stock`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching purchases: ${response.statusText}`);
            }
            const data = await response.json();
            setPurchases(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching purchases. Please try again later.');
        }
    };

    //get  purchaser/ledger name
    useEffect(() => {
        const fetchLedgerNames = async () => {
            try {
                const response = await fetch(`${BaseURL}/api/ledger`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ledger names - ${response.status}`);
                }
                const data = await response.json();
                setLedgerName(data.data);
            } catch (error) {
                console.error('Error fetching ledger names:', error.message);
                toast.error('Error fetching ledger names. Please try again later.');
            }
        };
        fetchLedgerNames();
    }, [accessToken]);

    const handleLedgerChange = (event) => {
        const name = event.target.value;
        setSelectedLedgerName(name);
        const ledger = ledgerName.find(l => l.ledgerName === name);
        if (ledger) {
            setSelectedLedgerID(ledger.ledgerID);
        } else {
            setSelectedLedgerID('');
        }
    };

    const filteredLedgerName = ledgerName.filter(ledger =>
        ledger.ledgerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    //bill total
    const calculateBillTotal = () => {
        let allTotal = 0;
        rows.forEach(row => {
            if (row.quantity && row.rate) {
                allTotal += parseFloat(row.quantity) * parseFloat(row.rate);
            }
        });
        return allTotal;
    };

    //discount change
    const handleDiscountChange = (e) => {
        const value = e.target.value.trim();
        if (value === '' || !isNaN(parseFloat(value))) {
            setDiscountPercentage(value === '' ? '' : parseFloat(value));
        }
    };

    //show discount price
    const calculateDiscount = () => {
        const billTotal = calculateBillTotal();
        const discountAmount = billTotal * (discountPercentage / 100);
        return Math.floor(discountAmount);
    };

    //calculate after discount
    const calculateTotalAfterDiscount = () => {
        const billTotal = calculateBillTotal();
        const totalAfterDiscount = billTotal - (billTotal * (discountPercentage / 100));
        return Math.floor(totalAfterDiscount);
    };


    //gst  
    const handleGstChange = (e) => {
        const value = e.target.value.trim();
        if (value === '' || !isNaN(parseFloat(value))) {
            setGstPercentage(value === '' ? '' : parseFloat(value));
        }
    };

    const calculateGst = () => {
        const totalAfterDiscount = calculateTotalAfterDiscount();
        const gstAmount = totalAfterDiscount * (gstPercentage / 100);
        return Math.floor(gstAmount);
        // return gstAmount;
    };

    //grand total
    const calculateGrandTotal = () => {
        const totalAfterDiscount = calculateTotalAfterDiscount();
        const grandTotal = totalAfterDiscount + (totalAfterDiscount * (gstPercentage / 100));
        return Math.floor(grandTotal);
    };

    //add row
    const addRow = () => {
        setRows([...rows, { bookName: '', quantity: '', rate: '', amount: '' }]);
    };

    const formatDate = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            if (!selectedLedgerName.trim()) {
                throw new Error('Please select purchaser name.');
            }
    
            const isBookFilled = rows.some(row => row.bookName.trim() !== '');
            if (!isBookFilled) {
                throw new Error('Please enter at least one book.');
            }
    
            const filteredRows = rows.filter(row => row.bookName.trim() !== '' && row.quantity.trim() !== '' && row.rate.trim() !== '');
            const payload = {
                invoiceNo: invoiceNumber,
                invoiceDate: formatDate(invoiceDate), // Format the date here
                ledgerIDF: selectedLedgerID,
                billTotal: calculateBillTotal(),
                discountPercent: discountPercentage,
                discountAmount: calculateDiscount(),
                totalAfterDiscount: calculateTotalAfterDiscount(),
                gstPercent: gstPercentage,
                gstAmount: calculateGst(),
                grandTotal: calculateGrandTotal(),
                stockDetails: filteredRows.map(row => ({
                    bookIdF: bookName.find(book => book.bookName === row.bookName)?.bookId,
                    bookQty: parseFloat(row.quantity),
                    bookRate: parseFloat(row.rate),
                    bookAmount: row.quantity && row.rate ? parseFloat(row.quantity) * parseFloat(row.rate) : 0
                }))
            };
    
            if (!accessToken) {
                throw new Error('Access token not found. Please log in again.');
            }
    
            const response = await fetch(`${BaseURL}/api/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`Failed to submit purchase: ${response.status} - ${response.statusText}`);
            }
            const stockDetails = await response.json();
            toast.success("Purchase successfully submitted.");
            handlePurchaseSubmit();
            fetchPurchases();
    
        } catch (error) {
            console.error('Error submitting purchase:', error.message);
            toast.error('Error submitting purchase. Please try again.');
        }
    };
    

    // handle change
    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    //  invoice date change
    const handleInvoiceDateChange = (e) => {
        setInvoiceDate(e.target.value);
    };

    //delete row
    const deleteRow = (index) => {
        const updatedRows = [...rows];
        updatedRows.splice(index, 1);
        setRows(updatedRows);
    };

    //book change
    const handleBookChangeForRow = (index, event) => {
        const name = event.target.value;
        const selectedBook = bookName.find(book => book.bookName === name);
        const updatedRows = [...rows];

        if (selectedBook) {
            updatedRows[index].bookName = name;
        } else {
            updatedRows[index].bookName = name;
        }
        setRows(updatedRows);
    };

    // Filtered book names based on selectedBooks
    const filteredBookNamesForRow = (rowIndex) => {
        return bookName.filter(book =>
            !selectedBooks.includes(book.bookId) ||
            selectedBooks[rowIndex] === book.bookId
        );
    };

    //get book
    const fetchBooks = async () => {
        try {
            const response = await fetch(`${BaseURL}/api/auth/book`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching books: ${response.statusText}`);
            }
            const data = await response.json();
            setBookName(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error fetching books. Please try again later.');
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div className='mb-4 purchase-page scrollar'>
            <div className='mt-1'>
                <ArrowReturnLeft className="back-icon" onClick={onBackButtonClick}>Back</ArrowReturnLeft>
            </div>

            <div className="main-content-1">
                <Container>
                    <Row className="purchase-main-1">
                        <Col xs={12} md={10} lg={12}>
                            <h1 className="mt-4">Purchase</h1>
                            <div className="mt-5 border-style-1">
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} lg={3} >
                                            <Form.Label>Purchase No</Form.Label>
                                            <Form.Control
                                                placeholder="Purchase number"
                                                type="text"
                                                className="small-input"

                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} lg={3} >
                                            <Form.Label>Purchase Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={invoiceDate}
                                                onChange={handleInvoiceDateChange}
                                                className="custom-date-picker small-input"
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} lg={6}>
                                            <Form.Label>Purchaser Name</Form.Label>
                                            <Form.Control
                                                as="input"
                                                className="small-input"

                                                list="ledgerNames"
                                                value={selectedLedgerName}
                                                onChange={handleLedgerChange}
                                                placeholder="Search or select purchaser name"
                                            />
                                            <datalist id="ledgerNames">
                                                {filteredLedgerName.map((ledger) => (
                                                    <option key={ledger.ledgerId} value={ledger.ledgerName} />
                                                ))}
                                            </datalist>
                                        </Form.Group>
                                    </Row>

                                    <div className="table-responsive">

                                        <Table striped bordered hover className="table-bordered-dark mt-5">
                                            <thead>
                                                <tr>
                                                    <th className="table-header sr-size">Sr.No</th>
                                                    <th className="table-header book-name-size">Book Name</th>
                                                    <th className="table-header quantity-size">Quantity</th>
                                                    <th className="table-header rate-size">Rate</th>
                                                    <th className="table-header amount-size amount-align">Amount</th>
                                                    <th className="table-header action-align">Action</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, index) => (
                                                    <tr key={index}>
                                                        <td className='sr-size'>{index + 1}</td>
                                                        <td>
                                                            <Form.Group as={Col} sm={12}>
                                                                <Form.Control
                                                                    as="input"
                                                                    list={`bookName-${index}`}
                                                                    value={row.bookName}
                                                                    onChange={(e) => { handleBookChangeForRow(index, e); }}
                                                                    placeholder="Select book name"
                                                                />
                                                                <datalist id={`bookName-${index}`}>
                                                                    {filteredBookNamesForRow(index).map((book) => (
                                                                        <option key={book.bookId} value={book.bookName} />
                                                                    ))}
                                                                </datalist>
                                                            </Form.Group>
                                                        </td>
                                                        <td>
                                                            <Form.Control className="right-align"
                                                                type="number"
                                                                name="quantity"
                                                                value={row.quantity}
                                                                onChange={(e) => handleRowChange(index, e)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control className="right-align"
                                                                type="number"
                                                                name="rate"
                                                                value={row.rate}
                                                                onChange={(e) => handleRowChange(index, e)}

                                                            />
                                                        </td>
                                                        <td className="amount-align">
                                                            {row.quantity && row.rate ? ((row.quantity) * (row.rate)).toFixed(2) : ''}
                                                        </td>
                                                        <td>
                                                            <Trash className="ms-3 action-icon delete-icon" onClick={() => deleteRow(index)} />
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <Button onClick={addRow} className="button-color">
                                                            Add Book
                                                        </Button>
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>

                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="right-align">Bill Total</td>
                                                    <td className="amount-align">{calculateBillTotal().toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="right-align">Discount</td>
                                                    <td>
                                                        <div className="input-with-suffix">
                                                            <Form.Control className="right-align" type="number" placeholder="Discount" value={discountPercentage} onChange={handleDiscountChange} />
                                                            <span>%</span>
                                                        </div>

                                                    </td>
                                                    <td className="amount-align">{calculateDiscount()}</td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="right-align">Total After Discount</td>
                                                    <td></td>
                                                    <td className="amount-align">{calculateTotalAfterDiscount()}</td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="right-align">GST</td>
                                                    <td>
                                                        <div className="input-with-suffix">
                                                            <Form.Control className="right-align" type="number" placeholder="GST" value={gstPercentage} onChange={handleGstChange} />
                                                            <span>%</span>
                                                        </div>
                                                    </td>
                                                    <td className="amount-align">{calculateGst()}</td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="right-align">Grand Total</td>
                                                    <td className="amount-align">{calculateGrandTotal()}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                        <div className='ms-3'>
                                            <Button onClick={onBackButtonClick}>Back</Button>
                                        </div>
                                        <div className='ms-3'>
                                            <Button className="button-color" type="submit">
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default PurchaseDetails;



