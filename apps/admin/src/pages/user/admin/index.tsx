"use client"
import Iconify from "@components/iconify";
import LoadingScreen from "@components/loading-screen/LoadingScreen";
import Scrollbar from "@components/scrollbar";
import { TableEmptyRows, TableHeadUsers, TableNoData, TablePaginationCustom, TableSelectedAction, useTable } from "@components/table";
import { useUserGet } from "@hooks/user/useUser";
// import { useAdministrationContext } from "@contexts/administration";
// import useFetchUsers from "@hooks/users/useFetchUsers";
import DashboardLayout from "@layouts/dashboard/DashboardLayout";
import { Box, Button, Card, Tabs, Divider, TableContainer, Tooltip, IconButton, Table, TableBody, CircularProgress, TextField } from "@mui/material";
import UserListRow from "@sections/user/list/UsersList";
import { ChangeEvent, useEffect, useState } from "react";

const UserList = () => {

    const TABLE_HEAD = [
        { id: 'name', label: 'Name', align: 'left' },
        { id: 'email', label: 'Email', align: 'left' },
        { id: 'wallet', label: 'Wallet', align: 'left' }
      ];
      const [name, setName] = useState<string>()

      const {dense, page, order, orderBy, rowsPerPage, onSort, onChangeDense, onChangePage, onChangeRowsPerPage,
      } = useTable();

    // const { filteredUsers } = useAdministrationContext();

    const [tableData, setTableData] = useState<any>([]);
    const {data, isFetching, refetch} = useUserGet(page, rowsPerPage, 'ADMIN', name)

    useEffect(() => {
      refetch()
    }, [name])

    let filteredData:any = []
    useEffect(() => {
      !isFetching &&  data?.rows?.map((row:any) => {
        const buffer = row.walletAddress && Buffer.from(row.walletAddress.data)
        const walletString = buffer &&` 0x${buffer.toString('hex')}`
        filteredData.push({
          id: row.id,
          name: row.name,
          email: row.email,
          wallet: walletString || 'N/A'
        })
      })
      setTableData(filteredData);
    }, [data, isFetching]);

    const sortedData = tableData.slice().sort((a:any, b:any) => {
      const isAsc = order === 'asc';
      return (a[orderBy] < b[orderBy] ? -1 : 1) * (isAsc ? 1 : -1);
    });

    const handleSearchChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setName(e.target.value)
    }

    return ( 

<DashboardLayout>
            <h2>Admin List</h2>
          <TextField id="outlined-basic" type='string' placeholder='Search admin' onChange={(e:any) => handleSearchChange(e)}/>
          <Card sx={{marginTop: 2}}>
          <Divider />
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            {/* <TableSelectedAction
              dense={dense}
              // numSelected={selected?.length}
              rowCount={tableData?.length}
              // onSelectAllRows={(checked) =>
              //   onSelectAllRows(
              //     checked,
              //     tableData.map((row:any) => row.id)
              //   )
              // }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={handleOpenConfirm}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Tooltip>
              }
            /> */}

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadUsers
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData?.length}
                  // numSelected={selected?.length}
                  onSort={onSort}
                  // onSelectAllRows={(checked) =>
                  //   onSelectAllRows(
                  //     checked,
                  //     tableData.map((row:any) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {sortedData &&
                    sortedData.map((row:any) => (
                      <UserListRow
                        key={row.id}
                        row={row}
                      />
                    ))}
                  {!isFetching ? <TableNoData
                  isNotFound={tableData.length === 0} /> : <CircularProgress color="inherit"/> }
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          {/* <TablePaginationCustom
            count={10}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            dense={dense}
            onChangeDense={onChangeDense}
          /> */}
        </Card>
        </DashboardLayout>
     );
}
 
export default UserList;