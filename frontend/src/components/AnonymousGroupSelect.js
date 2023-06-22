import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Help from '@material-ui/icons/Help';


const HtmlTooltip = withStyles((theme) => ({
	tooltip: {
	  backgroundColor: '#f5f5f9',
	  color: 'rgba(0, 0, 0, 0.87)',
	  maxWidth: 220,
	  fontSize: theme.typography.pxToRem(12),
	  border: '1px solid #dadde9',
	},
  }))(Tooltip);


const AnonymousGroupSelect = ({ anonymousGroup, groupsAll = [], onUpdateAnonymousGroup }) => {
	const anonymousGroupDescription = (
		<div>
			<p>You may wish to allow anonymous access, but still make use of the dynamic security plugin.</p>
			<p>This is supported through the automatic anonymous group. If allowed, anything connecting without a username will be assigned to a group that you define.</p>
			<p>By assigning roles to that group, you can control what anonymous devices can access.</p>
		</div>
	);

	const groupSuggestions = groupsAll
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

		return (
			<div style={{
				position: 'absolute',
				top: '67px',
				right: '10px',
				width: '200px',
				display: 'flex',
				alignItems: 'center',
				gap: '10px'
			}}>
				<TextField
					label="Anonymous Group"
					variant="outlined"
					select
					size="small"
					placeholder="Select Anonymous Group"
					options={groupSuggestions}
					value={anonymousGroup?.groupname || ''}
					onChange={(event) => {
						onUpdateAnonymousGroup(event.target.value);
					}}
					style={{ flex: 1 }}
				>
					{groupSuggestions.map((group) => (
						<MenuItem key={group.value}
							value={group.value}
							primaryText={group.label}
						>
							{group.label}
						</MenuItem>
					))}
				</TextField>
				<HtmlTooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Anonymous Group</Typography>
								{anonymousGroupDescription}
								<Link href="https://mosquitto.org/documentation/dynamic-security/#:~:text=Anonymous%20access,devices%20can%20access."
									color="inherit"
									target="_blank"
								>
									<u>{'Read more'}</u>
								</Link>
							</React.Fragment>
						}
						interactive
				>
					<IconButton
						size="small"
						style={{ paddingRight: '10px' }}
						id="select-anon-group"
						onClick={(event) => {
							event.stopPropagation();
							// onDeleteGroup(group.groupname);
						}}
					>
						<Help fontSize="small" />
					</IconButton>
				</HtmlTooltip>
			</div>
		);
};

const mapStateToProps = (state) => {
	return {
		anonymousGroup: state.groups?.anonymousGroup,
		groupsAll: state.groups?.groupsAll?.groups
	};
};

export default connect(mapStateToProps)(AnonymousGroupSelect);
