import Box from '@material-ui/core/Box';
import {useTheme} from '@material-ui/core/styles';
import React from 'react';

const ContainerBox = ({children, dataTour}) => {
	const theme = useTheme();

	return (
		<Box
			style={{
				height: '100%',
				backgroundColor: theme.palette.background.default
			}}
			data-tour={dataTour}
		>
			<Box
				style={{
					height: '100%',
					padding: '5px 15px 15px 15px',
					backgroundColor: theme.palette.background.default
				}}
			>
				{children}
			</Box>
		</Box>
	);
};
export default ContainerBox;
