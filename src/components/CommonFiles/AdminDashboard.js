/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { Container, Navbar, Nav, ListGroup, Image, NavDropdown, Modal, Button, Form, Col } from 'react-bootstrap';
import { PersonCircle, LockFill, BoxArrowRight, BookFill, HouseDoorFill, Book, Bookshelf, Globe, Archive, People, PersonFill, PeopleFill, CartPlus, BookHalf, ExclamationTriangleFill, ArrowReturnLeft, CartDashFill, FileEarmarkX, CurrencyDollar, Calendar, Gear, PlusCircle, Arrow90degRight, FileText, FileTextFill, JournalBookmarkFill, BookmarkCheckFill, ChevronDown } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../Auth/AuthProvider';
import logo from '../../assets/rajalib-removebg-preview.png';

//css
import '../CommonFiles/CommonCSS/AdminDashboard.css';
import '../../components/Inventory/InventoryTransaction/CSS/Purchase.css';

import DashboardData from './StaticDashboardData';

//transaction
import Issue from '../Inventory/InventoryTransaction/Issue';
import IssueReturn from '../Inventory/InventoryTransaction/IssueReturn';
import ViewPurchase from '../Inventory/InventoryTransaction/ViewPurchase';
import PurchaseReturn from '../Inventory/InventoryTransaction/PurchaseReturn';
import BookLost from '../Inventory/InventoryTransaction/BookLost';
import BookScrap from '../Inventory/InventoryTransaction/BookScrap';
import BookDetailsTable from '../Inventory/InventoryTransaction/BookDetailsTable';
import IssueRenew from '../Inventory/InventoryTransaction/IssueRenew';

//accession report
import Accession from '../Inventory/Report/AccessionReports/Accession';
import AccessionStatus from '../Inventory/Report/AccessionReports/AccessionStatus';
import BookTypeWiseReport from '../Inventory/Report/AccessionReports/BookTypeWiseReport';
import BookLanguageReport from '../Inventory/Report/AccessionReports/BookLanguageReport';
import BookAuthorWiseReport from '../Inventory/Report/AccessionReports/BookAuthorWiseReport';
import BookPublicationWiseReport from '../Inventory/Report/AccessionReports/BookPublicationWiseReport';
//issue report
import IssueRegister from '../Inventory/Report/IssueReport/IssueRegister';
import IssueRegisterMemberWise from '../Inventory/Report/IssueReport/IssueRegisterMemberWise';
import IssueRegisterBookWise from '../Inventory/Report/IssueReport/IssueRegisterBookWise';

//master
import Books from '../Inventory/InventoryMaster/Books';
import BookLanguages from '../Inventory/InventoryMaster/BookLanguages';
import BookTypes from '../Inventory/InventoryMaster/BookTypes';
import BookAuthor from '../Inventory/InventoryMaster/BookAuthor';
import BookPublication from '../Inventory/InventoryMaster/BookPublication';


//account
import Purchaser from '../Inventory/InventoryAccount/Purchaser';
import MembershipFees from '../Inventory/InventoryAccount/MembershipFees';
import LibararyFees from '../Inventory/InventoryAccount/LibararyFees';
import Config from '../Inventory/InventoryAccount/Config';
import MonthlyMembershipFee from '../Inventory/InventoryAccount/MonthlyMembershipFee';

//admin
import User from '../Auth/User';
import PermanentMember from '../Auth/PermanentMember';
import GeneralMember from '../Auth/GeneralMember';
import { DateRangeOutlined } from '@material-ui/icons';

const componentMapping = {
    home: DashboardData,
    //inventory transaction
    issue: Issue,
    issueReturn: IssueReturn,
    issueRenew: IssueRenew,
    purchase: ViewPurchase,
    purchaseReturn: PurchaseReturn,
    bookLost: BookLost,
    bookScrap: BookScrap,
    bookDetails: BookDetailsTable,
    //accession report
    accessionReport: Accession,
    accessionStatusReport: AccessionStatus,
    bookTypeWiseReport: BookTypeWiseReport,
    bookLanguageWiseReport: BookLanguageReport,
    bookAuthorWiseReport: BookAuthorWiseReport,
    bookPublicationWiseReport: BookPublicationWiseReport,
    //issue register report
    issueRegisterMemberWise: IssueRegisterMemberWise,
    issueRegisterBookWise: IssueRegisterBookWise,
    issueRegisterDateWise: IssueRegister,

    //inventory master
    books: Books,
    bookLanguages: BookLanguages,
    bookTypes: BookTypes,
    bookAuthors: BookAuthor,
    bookPublications: BookPublication,

    // account
    purchaser: Purchaser,
    libraryFees: LibararyFees,
    config: Config,
    memberFees: MembershipFees,
    monthlyMemberFees: MonthlyMembershipFee,

    //admin
    user: User,
    permanentMember: PermanentMember,
    generalMember: GeneralMember,
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    //auth
    const BaseURL = process.env.REACT_APP_BASE_URL;
    const { username, accessToken, logout, userId } = useAuth();

    const [viewState, setViewState] = useState('home');
    //transction
    const [showInventoryTransactionSubItems, setShowInventoryTransactionSubItems] = useState(false);
    //transction report
    const [showInventoryTransactionReportSubItems, setShowInventoryTransactionReportSubItems] = useState(false);
    const [showInventoryTransactionIssueReportSubItems, setShowInventoryTransactionIssueReportSubItems] = useState(false);
    const [showInventoryTransactionAccessionReportSubItems, setShowInventoryTransactionAccessionReportSubItems] = useState(false);

    //master
    const [showInventoryMasterSubItems, setShowInventoryMasterSubItems] = useState(false);
    //master report
    const [showInventoryMasterReportSubItems, setShowInventoryMasterReportSubItems] = useState(false);
    // const [showInventoryMasterIssueReportSubItems, setShowInventoryMasterIssueReportSubItems] = useState(false);

    //account
    const [showAccountSubItems, setShowAccountSubItems] = useState(false);
    //account report
    const [showAccountReportSubItems, setShowAccountReportSubItems] = useState(false);

    //admin
    const [showAdminSubItems, setShowAdminSubItems] = useState(false);
    //admin report
    const [showAdminReportSubItems, setShowAdminReportSubItems] = useState(false);

    //change password
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [credentials, setCredentials] = useState({ password: '', confirmPassword: '' });

    //mobile view 
    const sidebarRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };



    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setShowSidebar(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const resetFormFields = () => {
        setCredentials({
            password: '',
            confirmPassword: ''
        });
    };


    //change password
    const handleChange = (event) => {
        const { name, value } = event.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
            [name]: value
        }));
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        const { password, confirmPassword } = credentials;
        if (password !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        try {
            const response = await fetch(`${BaseURL}/api/general-members/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ userId, password, confirmPassword }),
            });

            if (response.ok) {
                toast.success('Password changed successfully.');
                setShowChangePasswordModal(false);
                resetFormFields();
            } else {
                const data = await response.json();
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred. Please try again.');
        }
    };

    //logout
    const handleLogout = () => {
        logout();
        sessionStorage.clear();
        toast.success('You have been logged out.');
        navigate('/');
    };

    //call component
    const ComponentToRender = componentMapping[viewState];

    const formatViewState = (viewState) => {
        return viewState
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };


    return (
        <div className='main-dashboard-member'>
            <div ref={sidebarRef} className={`sidebar-admin ${showSidebar ? 'active' : ''}`}>
                <div className="d-flex sidebar-member" id="wrapper">
                    <div className="admin-sidebar">
                        <div className='mt-3 mb-3 ms-3'>
                            <Image src={logo} className="rajalib-logo" height="50" />
                            <span className="h4 ms-2 mt-4">Rajaram Library</span>
                        </div>
                        <div className='scrollable'>
                            <ListGroup variant="flush" className="mt-3 custom-list-group">
                                <Col lg={10} className="ms-3 list-group">
                                    <ListGroup.Item className="sub-icon" action onClick={() => { setViewState('home'); setShowSidebar(false); }}>
                                        <HouseDoorFill className="icon" /> Home
                                    </ListGroup.Item>

                                    <ListGroup.Item className="admin-general-icon mt-2" action onClick={() => setShowInventoryTransactionSubItems(!showInventoryTransactionSubItems)}>
                                        <Archive className="icon me-2" /> Inventory Transaction
                                    </ListGroup.Item>
                                    {showInventoryTransactionSubItems && (
                                        <div className='ms-2'>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issue'); setShowSidebar(false); }}>
                                                <ExclamationTriangleFill className="me-2" /> Issue
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueReturn'); setShowSidebar(false); }}>
                                                <ArrowReturnLeft className="me-2 icon" /> Issue Return
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueRenew'); setShowSidebar(false); }}>
                                                <ArrowReturnLeft className="me-2 icon" /> Issue Renew
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('purchase'); setShowSidebar(false); }}>
                                                <CartPlus className="icon me-2" /> Purchase
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('purchaseReturn'); setShowSidebar(false); }}>
                                                <CartDashFill className="me-2 icon" /> Purchase Return
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookLost'); setShowSidebar(false); }}>
                                                <BookHalf className="me-2 icon" /> Book Lost
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookScrap'); setShowSidebar(false); }}>
                                                <FileEarmarkX className="me-2 icon" /> Book Scrap
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookDetails'); setShowSidebar(false); }}>
                                                <BookFill className="icon me-2" /> Book Details
                                            </ListGroup.Item>
                                        </div>
                                    )}

                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowInventoryTransactionReportSubItems(!showInventoryTransactionReportSubItems)}>
                                        <Archive className="icon me-2" /> Transaction Report
                                    </ListGroup.Item>
                                    {showInventoryTransactionReportSubItems && (

                                        <div className='ms-2'>
                                            <ListGroup.Item className="sub-icon mt-2" action onClick={() => { setShowInventoryTransactionAccessionReportSubItems(!showInventoryTransactionAccessionReportSubItems) }}>
                                                <PlusCircle className="icon me-2" />Accession Report <ChevronDown />
                                            </ListGroup.Item>
                                            {showInventoryTransactionAccessionReportSubItems && (
                                                <div>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('accessionReport'); setShowSidebar(false); }}>
                                                        <FileText className="icon me-2" /> Accession
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('accessionStatusReport'); setShowSidebar(false); }}>
                                                        <FileTextFill className="icon me-2" /> Accession Status
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookTypeWiseReport'); setShowSidebar(false); }}>
                                                        <Bookshelf className="icon me-2" /> Book Type Wise
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookLanguageWiseReport'); setShowSidebar(false); }}>
                                                        <Globe className="icon me-2" /> Language Wise
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookAuthorWiseReport'); setShowSidebar(false); }}>
                                                        <JournalBookmarkFill className="icon me-2" /> Author Wise
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookPublicationWiseReport'); setShowSidebar(false); }}>
                                                        <BookmarkCheckFill className="icon me-2" /> Publication Wise
                                                    </ListGroup.Item>
                                                </div>
                                            )}

                                            <ListGroup.Item className="sub-icon mt-2" action onClick={() => setShowInventoryTransactionIssueReportSubItems(!showInventoryTransactionIssueReportSubItems)}>
                                                <PlusCircle className="icon me-2" /> Issue Report <ChevronDown />
                                            </ListGroup.Item>
                                            {showInventoryTransactionIssueReportSubItems && (
                                                <div>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueRegisterDateWise'); setShowSidebar(false); }}>
                                                        <DateRangeOutlined className="icon me-2" /> Date Wise Register
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueRegisterMemberWise'); setShowSidebar(false); }}>
                                                        <PersonCircle className="icon me-2" /> Member Register
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueRegisterBookWise'); setShowSidebar(false); }}>
                                                        <Book className="icon me-2" /> Book Wise Register
                                                    </ListGroup.Item>
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowInventoryMasterSubItems(!showInventoryMasterSubItems)}>
                                        <Archive className="icon me-2" /> Inventory Master
                                    </ListGroup.Item>
                                    {showInventoryMasterSubItems && (
                                        <div className='ms-2'>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('books'); setShowSidebar(false); }}>
                                                <Book className="me-2" /> Book
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookTypes'); setShowSidebar(false); }}>
                                                <Bookshelf className="me-2" /> Book Types
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookLanguages'); setShowSidebar(false); }}>
                                                <Globe className="me-2" /> Book Languages
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookAuthors'); setShowSidebar(false); }}>
                                                <PersonFill className="me-2" /> Book Author
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('bookPublications'); setShowSidebar(false); }}>
                                                <BookHalf className="me-2" /> Book Publication
                                            </ListGroup.Item>
                                        </div>
                                    )}

                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowInventoryMasterReportSubItems(!showInventoryMasterReportSubItems)}>
                                        <Archive className="icon me-2" /> Master Report
                                    </ListGroup.Item>
                                    {showInventoryMasterReportSubItems && (
                                        <div className='ms-2'>
                                            {/* <ListGroup.Item className="sub-icon mt-1" action onClick={() => setShowInventoryMasterIssueReportSubItems(!showInventoryMasterIssueReportSubItems)}>
                                                <PlusCircle className="icon me-2" /> Issue Report
                                            </ListGroup.Item>
                                            {showInventoryMasterIssueReportSubItems && (
                                                <div>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueMasterReport1'); setShowSidebar(false); }}>
                                                        <ExclamationTriangleFill className="icon me-2" /> Issue 1
                                                    </ListGroup.Item>
                                                    <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('issueMasterReport2'); setShowSidebar(false); }}>
                                                        <ExclamationTriangleFill className="icon me-2" /> Issue 2
                                                    </ListGroup.Item>
                                                </div>
                                            )} */}



                                        </div>
                                    )}

                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowAccountSubItems(!showAccountSubItems)}>
                                        <Archive className="icon me-2" /> Account
                                    </ListGroup.Item>
                                    {showAccountSubItems && (
                                        <div className='ms-2'>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('purchaser'); setShowSidebar(false); }}>
                                                <PersonFill className="me-2" /> Purchaser
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('memberFees'); setShowSidebar(false); }}>
                                                <CurrencyDollar className="me-2" /> Membership Fees
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('monthlyMemberFees'); setShowSidebar(false); }}>
                                                <Calendar className="me-2" /> Monthly Fees
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('libraryFees'); setShowSidebar(false); }}>
                                                <Book className="me-2" /> Library Fees
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-1" action onClick={() => { setViewState('config'); setShowSidebar(false); }}>
                                                <Gear className="me-2" /> Config
                                            </ListGroup.Item>
                                        </div>
                                    )}


                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowAccountReportSubItems(!showAccountReportSubItems)}>
                                        <Archive className="icon me-2" /> Account Report
                                    </ListGroup.Item>
                                    {showAccountReportSubItems && (
                                        <div className='ms-2'>

                                        </div>
                                    )}

                                    <ListGroup.Item className="admin-general-icon mt-3" action onClick={() => setShowAdminSubItems(!showAdminSubItems)}>
                                        <Archive className="icon me-2" /> Admin
                                    </ListGroup.Item>
                                    {showAdminSubItems && (
                                        <div className='ms-2'>
                                            <ListGroup.Item className="sub-icon mt-2" action onClick={() => { setViewState('user'); setShowSidebar(false); }}>
                                                <PersonFill className="icon me-2" /> User
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-2" action onClick={() => { setViewState('permanentMember'); setShowSidebar(false); }}>
                                                <PeopleFill className="me-2" /> Permanent Members
                                            </ListGroup.Item>
                                            <ListGroup.Item className="sub-icon mt-2" action onClick={() => { setViewState('generalMember'); setShowSidebar(false); }}>
                                                <People className="icon me-2" /> General Member
                                            </ListGroup.Item>
                                        </div>
                                    )}

                                    <ListGroup.Item className="admin-general-icon mt-3 mb-3" action onClick={() => setShowAdminReportSubItems(!showAdminReportSubItems)}>
                                        <Archive className="icon me-2" /> Admin Report
                                    </ListGroup.Item>
                                    {showAdminReportSubItems && (
                                        <div className='ms-2'>

                                        </div>
                                    )}

                                </Col>
                            </ListGroup>
                        </div>
                    </div>
                </div>
            </div>


            <div className='dashboard-member-page-details'>
                <Navbar className="mb-4 border-bottom navabar-color dashboard-member-navabar">
                    <div className="sidebar-toggle d-md-none color-black mt-1" onClick={toggleSidebar}>
                        ☰
                    </div>
                    <Nav className="ms-4 mt-2">
                        {/* <div className="selected-item">{viewState}</div> */}
                        <div className="selected-item">{formatViewState(viewState)}</div>

                    </Nav>
                    <Navbar.Toggle aria-controls="basic-navbar-nav " />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto "></Nav>
                        <NavDropdown title={<div className="logo-container"><PersonCircle size={30} /></div>} id="navbarScrollingDropdown" className='ms-0 logo-size' align="end">
                            <div className="username-container">
                                <PersonFill className="icon me-2 ms-3" />
                                {username}
                                <hr className="horizontal-line" />
                            </div>
                            <NavDropdown.Item onClick={() => setShowChangePasswordModal(true)}>
                                <LockFill className="icon" /> Change Password
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>
                                <BoxArrowRight className="icon" /> Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Navbar.Collapse>
                </Navbar>

                <Container fluid className="d-flex flex-column justify-content-between admin-main-content">
                    {ComponentToRender && <ComponentToRender />}
                </Container>

            </div>


            <Modal show={showChangePasswordModal} onHide={() => { setShowChangePasswordModal(false); resetFormFields() }}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleChangePassword}>
                        <Form.Group className="mt-2" controlId="formBasicPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mt-4" controlId="formBasicConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm new password"
                                name="confirmPassword"
                                value={credentials.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end mt-4">
                            <Button type="submit" className='button-color'>
                                Change Password
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
