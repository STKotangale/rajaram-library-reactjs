import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, ListGroup, Image, NavDropdown, Modal, Button, Form, Col } from 'react-bootstrap';
import { PersonCircle, LockFill, BoxArrowRight, BookFill, HouseDoorFill, CartPlusFill, Book, ExclamationTriangleFill, ArrowReturnLeft, CartDashFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import '../CommonFiles/CommonCSS/Dashboard.css';
import '../../components/Library/LibraryCSS/PurchaseBookDashboardData.css';

import logoImage from '../../assets/rajalib.png';
import Footer from './Footer';

import DashboardData from './StaticDashboardData';

import BookDetails from '../Library/Purchase/BookDetails';
import PurchaseDetails from '../Library/Purchase/PurchaseDetails';
import ShowPurchase from '../Library/Purchase/ShowPurchase';

import { useAuth } from '../Auth/AuthProvider';
import BookLanguages from '../Library/BookLanguages';
import BookTypes from '../Library/BookType';

const Dashboard = () => {
    const navigate = useNavigate();

    const [viewDashboard, setViewDashboard] = useState(true);
    const [fillPurchaseDetails, setFillPurchaseDetails] = useState(false);
    const [fillBookDetails, setFillBookDetails] = useState(false);

    const [bookType, setBookType] = useState(false);
    const [bookLanguages, setBookLanguages] = useState(false);

    const [viewPurchaseDetails, setViewPurchaseDetails] = useState(false);

    //change password
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [credentials, setCredentials] = useState({
        password: '',
        confirmPassword: ''
    });

    const { username, accessToken } = useAuth();

    //get username and access token
    useEffect(() => {

    }, [username, accessToken]);


    const handleHomeClick = () => {
        setViewDashboard(true);
        setFillPurchaseDetails(false);
        setFillBookDetails(false);
        setViewPurchaseDetails(false);
        setBookType(false);
    };

    const handlePurchaseDetailsClick = () => {
        setFillPurchaseDetails(true);
        setFillBookDetails(false);
        setViewDashboard(false);
        setViewPurchaseDetails(false);
        setBookLanguages(false);
        setBookType(false);


    };

    const handleBookDetailsClick = () => {
        setFillBookDetails(true);
        setFillPurchaseDetails(false);
        setViewDashboard(false);
        setViewPurchaseDetails(false);
        setBookLanguages(false);
        setBookType(false);


    };

    const handleBookLanguages = () => {
        setBookLanguages(true);
        setViewPurchaseDetails(false);
        setFillBookDetails(false);
        setFillPurchaseDetails(false);
        setViewDashboard(false);
        setBookType(false);

    };

    const handleShowPurchase = () => {
        setViewPurchaseDetails(true);
        setFillBookDetails(false);
        setFillPurchaseDetails(false);
        setViewDashboard(false);
        setBookLanguages(false);
        setBookType(false);
    };

    const handleBookType = () => {
        setViewPurchaseDetails(false);
        setFillBookDetails(false);
        setFillPurchaseDetails(false);
        setViewDashboard(false);
        setBookLanguages(false);
        setBookType(true);
    };





    //change password
    const handleChange = (event) => {
        const { name, value } = event.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
            [name]: value
        }));
    };

    const handleChangePassword = (event) => {
        event.preventDefault();
        const { password, confirmPassword } = credentials;
        if (password === confirmPassword) {
            console.log('Password changed successfully!');
            // Here, you'd handle the password change logic
            setShowChangePasswordModal(false);
            setCredentials({ password: '', confirmPassword: '' });
        } else {
            console.log('Passwords do not match.');
        }
    };

    //handle logout
    const handleLogout = () => {
        sessionStorage.clear();
        toast.success('You have been logged out.');
        navigate('/');
    };
    // const handleGroupMemberLogin = () => {
    //     navigate('/')
    // }

    const handleIssueClick = () => {

    }
    const handleIssueReturnClick = () => {

    }
    const handlePurchaseReturnClick = () => {

    }

    return (
        <div className='main-dashboard'>
            <div className="d-flex sidebar" id="wrapper">
                <div className="bg-white border-right ms-3" id="sidebar-wrapper">
                    <div className='mt-3'>
                        <Image src={logoImage} className="rajalib-logo" height="50" />
                        <span className="h4 ms-2 mt-3">Rajaram Library</span>
                    </div>
                    <ListGroup variant="flush" className="mt-5 custom-list-group">
                        <Col lg={11} className="">
                            <ListGroup.Item className="home-icon" action onClick={handleHomeClick}>
                                <HouseDoorFill className="icon" /> Home
                            </ListGroup.Item>
                            <ListGroup.Item className="admin-general-icon mt-2" action>
                                <Book className="icon" /> Library
                            </ListGroup.Item>
                            <ListGroup.Item className="purchase-icon mt-1" action onClick={handlePurchaseDetailsClick}>
                                <CartPlusFill className="icon" /> Purchase
                            </ListGroup.Item>
                            <ListGroup.Item className="book-icon mt-1" action onClick={handleBookDetailsClick}>
                                <BookFill className="icon" /> Book Details
                            </ListGroup.Item>

                            <ListGroup.Item className="purchase-return-icon mt-1" action onClick={handleBookLanguages}>
                                Book Languages
                            </ListGroup.Item>

                            <ListGroup.Item className="purchase-return-icon mt-1" action onClick={handleBookType}>
                                Book Type
                            </ListGroup.Item>




                            <ListGroup.Item className="issue-icon mt-1" action onClick={handleShowPurchase}>
                                <ExclamationTriangleFill className="icon" /> Show Purchase
                            </ListGroup.Item>
                            <ListGroup.Item className="issue-icon mt-1" action onClick={handleIssueClick}>
                                <ExclamationTriangleFill className="icon" /> Issue
                            </ListGroup.Item>
                            <ListGroup.Item className="issue-return-icon mt-1" action onClick={handleIssueReturnClick}>
                                <ArrowReturnLeft className="icon" /> Issue Return
                            </ListGroup.Item>
                            <ListGroup.Item className="purchase-return-icon mt-1" action onClick={handlePurchaseReturnClick}>
                                <CartDashFill className="icon" /> Purchase Return
                            </ListGroup.Item>



                            {/* <ListGroup.Item className="admin-general-icon mt-2" action>
                                    <People className="icon" /> General Member
                                </ListGroup.Item>
                                <ListGroup.Item className="login-icon mt-1" action onClick={handleGroupMemberLogin}>
                                    <BoxArrowInRight className="icon" />Login
                                </ListGroup.Item> */}
                        </Col>
                    </ListGroup>
                </div>
                <div id="page-content-wrapper" className='page-details'>
                    <Navbar bg="light" expand="lg" className="mb-4 border-bottom navabar-color dashboard-navabar">
                        <Navbar.Brand href="#Dashboard">Library Management System</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                {/* <Nav.Link className='ms-4' href="/">Home</Nav.Link>
                                <Nav.Link className='ms-4' href="/aboutus">About Us</Nav.Link>
                                <Nav.Link className='ms-4' href="/contactus">Contact Us</Nav.Link> */}
                            </Nav>
                            {/* <Nav> */}
                            <NavDropdown title={<PersonCircle size={30} />} id="navbarScrollingDropdown" className='ms-4' align="end">
                                {/* <NavDropdown.Item href="#profile">
                                        <PersonCircle className="icon" /> Profile
                                    </NavDropdown.Item> */}
                                <NavDropdown.Item onClick={setShowChangePasswordModal}>
                                    <LockFill className="icon" /> Change Password
                                </NavDropdown.Item>
                                <NavDropdown.Item href="#logout" onClick={handleLogout}>
                                    <BoxArrowRight className="icon" /> Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                            {/* </Nav> */}
                        </Navbar.Collapse>
                    </Navbar>
                    <Container fluid className="min-vh-100 d-flex flex-column justify-content-between main-content">
                        {/* <Container fluid className="container-fluid main-details"> */}
                        {viewDashboard && <DashboardData />}
                        {fillPurchaseDetails && <PurchaseDetails />}
                        {fillBookDetails && <BookDetails />}

                        {bookLanguages && <BookLanguages />}

                        {bookType && <BookTypes />}


                        {viewPurchaseDetails && <ShowPurchase />}

                    </Container>
                    <Footer />
                </div>
            </div>

            <Modal show={showChangePasswordModal} onHide={() => { setShowChangePasswordModal(false) }}>
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
                            <Button className="button-color" type="submit">
                                Change Password
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default Dashboard;
