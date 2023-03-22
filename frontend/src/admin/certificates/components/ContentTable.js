import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

const ContentTable = ({ children, columns }) => {
	return (
		<TableContainer>
			<Table stickyHeader size="small" aria-label="sticky table">
				<TableHead>
					<TableRow>
						{columns.map((column) => (
							<TableCell
								align={column.align}
								key={column.id}
								style={{
									width: column.width,
								}}
							>
								{column.key}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>{children}</TableBody>
			</Table>
		</TableContainer>
	);
};
export default ContentTable;
