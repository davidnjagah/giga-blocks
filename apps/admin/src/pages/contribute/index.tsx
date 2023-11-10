'use client';
import Scrollbar from '@components/scrollbar';
import {
  TableEmptyRows,
  TableHeadUsers,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from '@components/table';
import DashboardLayout from '@layouts/dashboard/DashboardLayout';
import {
  Box,
  Button,
  Card,
  Tabs,
  Divider,
  TableContainer,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Autocomplete,
  TextField,
} from '@mui/material';
import {CircularProgress} from '@mui/material';
import SchoolTableRow from '@sections/user/list/SchoolTableRow';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { Queries } from 'src/libs/graph-query';
import { useSchoolCount, useSchoolGet } from "@hooks/school/useSchool";
import { useContributeGet, useContributionValidate } from '@hooks/contribute/useContribute';
import ContributeTableRow from '@sections/user/list/ContributTableRow';
import { useSnackbar } from '@components/snackbar';
import { useUserGet } from '@hooks/user/useUser';

const ContributeData = () => {
  const TABLE_HEAD = [
    { id: 'name', label: 'Contributer name', align: 'left' },
    { id: 'school', label: 'School', align: 'left' },
    {id:'contributedData',label:'Contributed Data',align:'left'},
    { id: 'date', label: 'Date', align: 'left' }
  ];

  const {
    dense,
    page,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    onSelectRow,
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
    setOrder,
    setOrderBy
  } = useTable();

  const { enqueueSnackbar } = useSnackbar();

  const [selectedValues, setSelectedValues] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const{data:total} = useSchoolCount('MINTED');
  const[result] = useQuery({query:Queries.nftListQuery,variables:{skip:page*rowsPerPage,first:rowsPerPage}});
  const{data, fetching, error} = result;
  const {mutate, isSuccess:isValidationSuccess, isError:isValidationError} = useContributionValidate()
  const [searchBy, setSearchBy] = useState<string>();
  const [selectedSchoolSearch, setSelectedSchoolSearch] = useState("")
  const [selectedContributerSearch, setSelectedContributerSearch] = useState("")
  const {data:contributerList, refetch:userRefetch} = useUserGet(1, 10, 'CONTRIBUTOR')
  const [searchSchoolQuery, setSearchSchoolQuery] = useState('')
  const [searchContributeQuery, setSearchContributeQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const {data:ContributedData, isFetching, refetch} = useContributeGet({page,perPage: rowsPerPage, schoolId: selectedSchoolSearch, contributeId: selectedContributerSearch, status: selectedStatus})
  const {data:schoolList, refetch:refetchSchool} = useSchoolGet({perPage: 10, name: searchSchoolQuery})

  const decodeSchooldata = (data:any) => {
    const encodeddata = data.tokenUris;
    const decodedShooldata = [];
    for (let i = 0; i < encodeddata.length; i++) {
      const decodedData = atob(encodeddata[i].tokenUri.substring(29));
      const schoolData = {
        tokenId: encodeddata[i].id,
        ...JSON.parse(decodedData),
      };
      decodedShooldata.push(schoolData);
    }
    ContributedData?.rows  && ContributedData?.rows.map((row: any) => {
      const contributedData = Object.entries(row.contributed_data || {});
      const jsonString = JSON.parse(contributedData.map(pair => pair[1]).join('') || '{}');
      const date = new Date(row.createdAt).toLocaleDateString();
      filteredData.push({
        id: row?.id,
        name: row?.contributedUser?.name || '',
        school: row?.school?.name || '',
        contributedDataKey: Object.keys(jsonString) || '',
        contributedDataValue: Object.values(jsonString) || '',
        date:date || ''
      });
    }
    )
    setTableData(filteredData);
  };

  useEffect(() => {
    refetch()
  }, [selectedSchoolSearch, selectedContributerSearch, selectedStatus])

  let filteredData: any = [];
  useEffect(() => {
    if(data) decodeSchooldata(data);
  }, [data, isFetching]);

  const onSelectAllRows = (e:any) => {
    const isChecked = e.target.checked;
    if(isChecked){
      setSelectedValues(tableData)
    }
    else{
      setSelectedValues([])
    }
  }

  let tempArray:object[] = [];
  const onContribute = (validity:boolean) => {
    selectedValues.map((value:any) => {
      tempArray.push({contributionId: value?.id, isValid: validity})
    })
    const payload = {contributions: tempArray}
    mutate(payload)
    tempArray = [];
  }

  useEffect(() => {
    isValidationSuccess && enqueueSnackbar("Successfully updated contribution", { variant: 'success' })
    isValidationError && enqueueSnackbar("Unsuccessful", { variant: 'error' })
  }, [isValidationSuccess, isValidationError])

  const handleSearchByChange = (event: any) => {
    setSearchBy(event.target.value as string);
  };

  const handleSearchChange = (value: any) => {
    setSelectedSchoolSearch(value?.id);
  }

  const handleContributerChange = (value: any) => {
    setSelectedContributerSearch(value?.id);
  }

  const handleValidChange = (event: any) => {
    setSelectedSchoolSearch('');
    setSelectedContributerSearch('');
    setSelectedStatus(event.target.value);
  }

  const sortedData = tableData.slice().sort((a:any, b:any) => {
    const isAsc = order === 'asc';
    return (a[orderBy] < b[orderBy] ? -1 : 1) * (isAsc ? 1 : -1);
  });

  const statusArray = ['Validated', 'Pending']
  
  return (
    <DashboardLayout>
      <div style={{display: 'flex', justifyContent: 'space-between',marginBottom: '20px'}}>
          <span style={{fontSize: '1.5em', fontWeight: '600'}}>Contributed Data <span style={{fontSize: '0.75em', fontWeight: '400'}}> {selectedValues.length > 0 && `(${selectedValues.length})`} </span></span>
          {/* <div style={{display: 'flex', gap: '15px'}}>
          <Button variant="contained" style={{background: '#474747'}} disabled={selectedValues.length <= 0} onClick={() => onContribute(false)}>Invalidate</Button>
          <Button variant="contained" style={{background: '#474747'}} disabled={selectedValues.length <= 0} onClick={() => onContribute(true)}>Validate</Button>
          </div> */}
          </div>
          <Box sx={{ minWidth: 120 }}>
      <FormControl sx={{width: 150}}>
        <InputLabel id="demo-simple-select-label">Search by</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={searchBy}
          label="Search"
          onChange={handleSearchByChange}
        >
          <MenuItem value={'School'}>School</MenuItem>
          <MenuItem value={'Contributer'}>Contributer</MenuItem>
        </Select>
      </FormControl>
      {searchBy && searchBy === 'School' ? <FormControl sx={{width: 170, marginLeft: 2}}>
        <Autocomplete
        id="demo-simple-select"
        options={schoolList && schoolList?.rows as Array<{ id: string, name: string }>}
        getOptionLabel={(school:any) => school.name}
        value={searchBy}
        onChange={(event, value) => {
          handleSearchChange(value);
        }}
        onInputChange={(event, newInputValue) => {
          setSearchSchoolQuery(newInputValue);
          refetchSchool()
        }}
        renderInput={(params) => <TextField {...params} label="Search" />}
      />
      </FormControl> : 
      <FormControl sx={{width: 150, marginLeft: 2}}>
      <Autocomplete
        id="demo-simple-select"
        options={contributerList && contributerList?.rows as Array<{ id: string, name: string }>}
        getOptionLabel={(contributer:any) => contributer.name}
        value={searchBy}
        onChange={(event, value) => {
          handleContributerChange(value);
        }}
        onInputChange={(event, newInputValue) => {
          setSearchContributeQuery(newInputValue);
          userRefetch()
        }}
        renderInput={(params) => <TextField {...params} label="Search" />}
      />
    </FormControl>
      }
      <FormControl sx={{width: 150, marginLeft: 2}}>
      <InputLabel id="demo-simple-select-label">Filter By</InputLabel>
      <Select
        labelId="filter-by"
        id="filter-by"
        value={searchBy}
        label={searchBy}
        onChange={(event) => handleValidChange(event)}
      >
        {statusArray && statusArray?.map((status:any) => {
          return(
        <MenuItem value={status}>{status}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
    </Box>
      {fetching && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </div>}
      {!fetching &&
      <Card sx={{marginTop: 2}}>
        <Divider />
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadUsers
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData?.length}
                  showCheckBox={true}
                  onSort={onSort}
                  numSelected={selectedValues?.length}
                  onSelectAllRows={onSelectAllRows} 
                />
              <TableBody>
                {sortedData &&
                  sortedData.map((row: any) => (
                    <ContributeTableRow
                      key={row.id}
                      row={row}
                      selectedValues={selectedValues}
                      setSelectedValues={setSelectedValues}
                      rowData={row}
                      checkbox={true}
                    />
                  ))}
                {!isFetching ? <TableNoData
                  isNotFound={tableData.length === 0} /> : <CircularProgress color="inherit"/> }
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          count={ContributedData?.meta?.total}
          // count={tableData?.length}
          setPage={setPage}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
          dense={dense}
          onChangeDense={onChangeDense}
        />
      </Card>}
    </DashboardLayout>
  );
};

export default ContributeData;
