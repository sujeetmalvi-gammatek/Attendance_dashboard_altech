
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

export default function ReusableTable({ columns, rows, tableName, tableHeadColor , tableHeadBgColor}) {
    return (
        <Paper
            sx={{
                width: "100%",
                borderRadius: "5px",
                overflow: "hidden",
            }}
        >
            <TableContainer
                sx={{
                    maxHeight: "600px",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                align="center"
                                colSpan={columns.length}
                                sx={{
                                    background: "#fff",
                                    fontWeight: "bold",
                                    padding: "0px",
                                    backgroundColor: `${tableHeadBgColor}`,
                                    color :`${tableHeadColor}`,
                                    fontSize: "13px",
                                }}
                            >
                                {tableName}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    sx={{
                                        background: "#f1f1f1",
                                        fontWeight: "bold",
                                        padding: "0px",
                                        color: "black",
                                        fontSize: "12px",
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow key={i}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        sx={{
                                            padding: "1.5px",
                                            fontSize: "14px",
                                            color :"black",
                                            background : "#fafafaff"
                                        }}
                                    >
                                        {row[col.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
