/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Form, Table, Row, Col } from 'react-bootstrap';
import { useAuth } from '../Auth/AuthProvider';
import './Search.css'; // Import custom CSS
import _ from 'lodash';

const SearchDropdown = () => {
  const [selectedType, setSelectedType] = useState('Select search type');
  const [searchValue, setSearchValue] = useState('');
  const [bookData, setBookData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { accessToken } = useAuth();

  const fetchData = async () => {
    try {
      if (searchValue.trim() === '') {
        setFilteredData([]);
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/bookdetails/search`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setBookData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const debouncedFetchData = _.debounce(() => {
      fetchData();
    }, 300);

    if (searchValue.trim() !== '') {
      debouncedFetchData();
    }

    // Cleanup the debounce on unmount
    return () => {
      debouncedFetchData.cancel();
    };
  }, [searchValue, selectedType, accessToken]);

  useEffect(() => {
    const filterData = () => {
      if (searchValue.trim() === '') {
        setFilteredData([]);
        return;
      }

      const lowerCaseSearchValue = searchValue.toLowerCase();
      let filtered = bookData;

      if (selectedType === 'Book Name Wise') {
        filtered = filtered.filter(item => item.bookName.toLowerCase().includes(lowerCaseSearchValue));
      } else if (selectedType === 'Book Type Wise') {
        filtered = filtered.filter(item => item.bookTypeName.toLowerCase().includes(lowerCaseSearchValue));
      } else if (selectedType === 'Language Wise') {
        filtered = filtered.filter(item => item.bookLangName.toLowerCase().includes(lowerCaseSearchValue));
      } else if (selectedType === 'Author Wise') {
        filtered = filtered.filter(item => item.authorName.toLowerCase().includes(lowerCaseSearchValue));
      } else if (selectedType === 'Publication Wise') {
        filtered = filtered.filter(item => item.publicationName.toLowerCase().includes(lowerCaseSearchValue));
      }
      setFilteredData(filtered);
      setCurrentPage(1);
    };

    filterData();
  }, [selectedType, searchValue, bookData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatYesNo = (value) => value === 'Y' ? 'Yes' : 'No';

  return (
    <div>
      <Row className="align-items-center my-4">
        <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="dropdown-transparent">
              {selectedType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedType('Book Name Wise')}>Book Name Wise</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedType('Book Type Wise')}>Book Type Wise</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedType('Language Wise')}>Language Wise</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedType('Author Wise')}>Author Wise</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedType('Publication Wise')}>Publication Wise</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs="auto">
          <Form.Control
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: '200px' }}
          />
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            style={{ backgroundColor: '#F27E00', borderColor: '#F27E00' }}
            onClick={() => handlePageChange(1)}
          >
            Search
          </Button>
        </Col>
      </Row>

      <div className="table-responsive table-height">
        <Table striped bordered hover className='mt-1 table-responsive '>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Book Name</th>
              <th>Author Name</th>
              <th>Language</th>
              <th>Publication</th>
              <th>Book Type</th>
              <th>Working Start</th>
              <th>Lost</th>
              <th>Issue</th>
              <th>Scrap</th>
              <th>Return</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.bookDetailId}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{item.bookName}</td>
                  <td>{item.authorName}</td>
                  <td>{item.bookLangName}</td>
                  <td>{item.publicationName}</td>
                  <td>{item.bookTypeName}</td>
                  <td>{formatYesNo(item.bookWorkingStart)}</td>
                  <td>{formatYesNo(item.bookLost)}</td>
                  <td>{formatYesNo(item.bookIssue)}</td>
                  <td>{formatYesNo(item.bookScrap)}</td>
                  <td>{formatYesNo(item.book_return)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container mt-5">
          <Button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
            First Page
          </Button>
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            &lt;
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            &gt;
          </Button>
          <Button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
            Last Page
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
