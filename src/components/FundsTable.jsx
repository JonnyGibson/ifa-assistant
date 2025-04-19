import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Box,
  Text,
  Badge,
  Flex,
  Icon,
  Tooltip,
  Collapse,
  HStack,
  VStack,
  Divider
} from '@chakra-ui/react';
import { 
  FiExternalLink, 
  FiChevronDown, 
  FiChevronRight, 
  FiTrendingUp, 
  FiTrendingDown,
  FiUsers
} from 'react-icons/fi';

const formatPercentage = (value) => {
  if (value === undefined || value === null) return 'N/A';
  const formatted = value.toFixed(2);
  return `${formatted}%`;
};

const PerformanceBadge = ({ value }) => {
  if (value === undefined || value === null) return 'N/A';
  
  const color = value >= 0 ? 'green' : 'red';
  const icon = value >= 0 ? FiTrendingUp : FiTrendingDown;
  
  return (
    <Badge colorScheme={color} display="flex" alignItems="center" gap={1}>
      <Icon as={icon} />
      {formatPercentage(value)}
    </Badge>
  );
};

const ExpandedRow = ({ fund }) => {
  return (
    <Box p={4} bg="gray.50">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="bold">Performance Metrics</Text>
          <Text fontSize="sm" color="gray.600">Last Updated: {new Date(fund.lastUpdated).toLocaleDateString()}</Text>
        </HStack>
        <Flex gap={6}>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">3 Month Change</Text>
            <PerformanceBadge value={fund.performance?.threeMonthChange} />
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">1 Year Change</Text>
            <PerformanceBadge value={fund.performance?.oneYearChange} />
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">3 Year Change</Text>
            <PerformanceBadge value={fund.performance?.threeYearChange} />
          </VStack>
        </Flex>
        <Divider />
        <Box>
          <Text fontWeight="bold" mb={2}>Asset Allocation</Text>
          <HStack spacing={6}>
            <VStack align="start">
              <Text fontSize="sm" color="gray.600">UK Bonds</Text>
              <Text>{formatPercentage(fund.allocation?.ukBond)}</Text>
            </VStack>
            <VStack align="start">
              <Text fontSize="sm" color="gray.600">Non-UK Bonds</Text>
              <Text>{formatPercentage(fund.allocation?.nonUKBond)}</Text>
            </VStack>
            <VStack align="start">
              <Text fontSize="sm" color="gray.600">Cash</Text>
              <Text>{formatPercentage(fund.allocation?.cash)}</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

const FundsTable = ({ funds, portfolioCounts }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (isin) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(isin)) {
      newExpandedRows.delete(isin);
    } else {
      newExpandedRows.add(isin);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <Box overflowX="auto" shadow="md" rounded="lg" bg="white">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th width="40px"></Th>
            <Th>Fund Name</Th>
            <Th>SEDOL</Th>
            <Th>Category</Th>
            <Th isNumeric>Client Portfolios</Th>
          </Tr>
        </Thead>
        <Tbody>
          {funds.map((fund) => (
            <React.Fragment key={fund.isin}>
              <Tr 
                cursor="pointer" 
                onClick={() => toggleRow(fund.isin)}
                _hover={{ bg: 'gray.50' }}
              >
                <Td>
                  <Icon 
                    as={expandedRows.has(fund.isin) ? FiChevronDown : FiChevronRight}
                    color="gray.500"
                  />
                </Td>
                <Td>
                  <Text fontWeight="medium">{fund.name}</Text>
                </Td>
                <Td>
                  <Text color="gray.600">{fund.sedol}</Text>
                </Td>
                <Td>
                  <Badge colorScheme="blue" variant="subtle">
                    {fund.category}
                  </Badge>
                </Td>
                <Td isNumeric>
                  <HStack justify="flex-end" spacing={1}>
                    <Icon as={FiUsers} color="gray.500" />
                    <Text>{portfolioCounts[fund.isin] || 0}</Text>
                  </HStack>
                </Td>
              </Tr>
              <Tr>
                <Td colSpan={5} p={0}>
                  <Collapse in={expandedRows.has(fund.isin)}>
                    <ExpandedRow fund={fund} />
                  </Collapse>
                </Td>
              </Tr>
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default FundsTable; 