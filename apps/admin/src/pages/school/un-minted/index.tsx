'use client';
import Scrollbar from '@components/scrollbar';
import {
  TableHeadUsers,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from '@components/table';
import { useSchoolGet } from '@hooks/school/useSchool';
import DashboardLayout from '@layouts/dashboard/DashboardLayout';
import {
  Button,
  Card,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TextField,
} from '@mui/material';
import SchoolTableRow from '@sections/user/list/SchoolTableRow';
import { useRouter } from 'next/router';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { JsonRpcProvider, Signer } from 'ethers';
import { mintSignature } from '@components/web3/utils/wallet';
import { useBulkMintSchools } from '@hooks/school/useSchool';
import { useWeb3React } from '@web3-react/core';
import { useSnackbar } from '@components/snackbar';
import useDebounce from '@hooks/useDebounce';

const VerifiedSchool = () => {

    const TABLE_HEAD = [
        { id: 'name', label: 'School name', align: 'left' },
        { id: 'country', label: 'Location', align: 'left' },
        { id: 'latitude', label: 'Latitude', align: 'left' },
        { id: 'longitude', label: 'Longitude', align: 'left' },
        { id: 'status', label: 'Status', align: 'left' }
      ];

      const { enqueueSnackbar } = useSnackbar();

      const {push, query} = useRouter()

      const [school, setSchool] = useState<any>()

      const uploadId = query.uploadId;

      const {dense, page, setPage, order,  orderBy, rowsPerPage, onChangePage, onSort, onChangeDense, onChangeRowsPerPage,
      } = useTable({defaultOrderBy: 'createdAt', defaultOrder: 'desc'});

  const {
    mutate,
    isError: isMintError,
    data: mintData,
    isSuccess: isMintSuccess,
    error: mintingError,
    isLoading: isMinting
  } = useBulkMintSchools();

  const provider = useWeb3React();
  const [selectedValues, setSelectedValues] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [country, setCountry] = useState<string>()
  const debouncedValue = useDebounce(`${school} + ${country}`, 300)
  const { data, isLoading, refetch, isFetching } = useSchoolGet({page, perPage: rowsPerPage, minted: 'NOTMINTED', uploadId, country, school, order, orderBy, debouncedValue});

  useEffect(() => {
    refetch()
  }, [uploadId, isMintSuccess, mintingError, order, orderBy])

  let filteredData: any = [];
  useEffect(() => {
    !isLoading &&
    data?.rows &&  data?.rows?.map((row: any) => {
        filteredData.push({
          id: row.id,
          giga_school_id:row.giga_school_id,
          schoolName: row.name,
          longitude: row.longitude,
          latitude: row.latitude,
          schoolType: row.school_type,
          country: row.country,
          connectivity: row.connectivity,
          coverage_availabitlity: row.coverage_availability,
          electricity_availabilty: row.electricity_available,
          mintedStatus: row.minted,
        });
      });

    setTableData(filteredData);
  }, [data, isLoading, uploadId]);
  
    const mintSchool = useCallback(async () => {
      if(selectedValues.length === 0){
        enqueueSnackbar("Please select atleast one school", { variant: 'error' })
        return Error("Please select atleast one school");
      } 
      setSelectedValues([])
      mutate({data:selectedValues})
    },[selectedValues])

    useEffect(() => {
      isMintSuccess && enqueueSnackbar("Minted Successfully", { variant: 'success' })
      mintingError && enqueueSnackbar("Miniting error", { variant: 'error' })
    }, [isMintSuccess, mintingError])

    let test;
    const onSelectAllRows = (e:any) => {
      const isChecked = e.target.checked
      test = isChecked
      if(isChecked){
        setSelectedValues(tableData)
      }
      else{
        setSelectedValues([])
      }
    }

    const uploadSchool = () => {
      push('/school/import')
    }

    const handleSearchChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCountry(e.target.value)
    }

    const handleSchoolChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSchool(e.target.value)
    }

    return ( 
        <DashboardLayout>
          <div style={{display: 'flex', justifyContent: 'space-between',marginBottom: '20px'}}>
          <span style={{fontSize: '1.5em', fontWeight: '600'}}>Unminted School</span>
          <div style={{display: 'flex', gap: '15px'}}>
            {isMinting ? <Button variant="contained" style={{background: '#474747'}} onClick={mintSchool}>Minting ({selectedValues.length}) NFT's</Button> :
            <Button variant="contained" style={{background: '#474747'}} onClick={mintSchool}>Mint {selectedValues.length > 0 && `(${selectedValues.length})`} </Button>
            }
          <Button variant="contained" style={{background: '#404040'}} onClick={uploadSchool}>Import School</Button>
          </div>
          </div>
          
          {uploadId && <span style={{color: '#008000', fontSize: '0.85em'}}>Recently imported school, <span onClick={() => push(`/school/un-minted`)} style={{color: '#795CB2', cursor: 'pointer'}}>List all</span></span>}

          <div style={{display: 'flex', alignItems: 'flex-end', gap: '20px'}}>
          <TextField id="outlined-basic" type='string' placeholder='Search school' onChange={(e) => handleSchoolChange(e)}/>
          <TextField id="outlined-basic" type='string' placeholder='Search country' onChange={(e) => handleSearchChange(e)}/>
          </div>
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
                  onSort={onSort}
                  showCheckBox={true}
                  numSelected={selectedValues?.length}
                  onSelectAllRows={onSelectAllRows}
                />

                <TableBody>
                  {tableData &&
                    tableData?.map((row:any) => (
                      <SchoolTableRow
                        key={row.id}
                        row={row}
                        selectedValues={selectedValues}
                        setSelectedValues={setSelectedValues}
                        rowData = {row}
                        checkbox = {true}
                      />
                    ))}
                  <TableNoData 
                  isNotFound={tableData.length === 0}
                  isFetching={isFetching}
                  />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={data?.meta?.total}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
        </DashboardLayout>
     );
}
 
export default VerifiedSchool;
