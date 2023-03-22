import React from 'react';
import {Hidden} from '@material-ui/core';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';

const getHeaderContent = (children) => {
	children = children.length ? children : children.props && children.props.children;
	const [header, content] = children?.length ? children : [children];
	return {header: content && header, content: content || header};
};
const ContentContainer = ({children, path}) => {
	// expecting header and content
	const {header, content} = getHeaderContent(children);
	const last = path.pop();

	return (
		<div style={{height: '100%'}}>
			{path && path.length &&
				<ContainerBreadCrumbs title={last.name} links={path}/>
			}
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					{header}
					<div style={{heigth: '100%', overflowY: 'visible'}}>
						{content}
					</div>
				</div>
			</div>
		</div>
	);
};
export default ContentContainer;
