import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

const ContentTable = ({ children, columns }) => {
	return (
		<TableContainer>
			<Table stickyHeader size="small" aria-label="sticky table">
				<TableHead>
					<TableRow>
						{columns.map((column) => (
							<TableCell aling={column.align} key={column.id}>
								{column.key}
							</TableCell>
						))}
						<TableCell />
					</TableRow>
				</TableHead>
				<TableBody>{children}</TableBody>
			</Table>
		</TableContainer>
	);
};
export default ContentTable;
