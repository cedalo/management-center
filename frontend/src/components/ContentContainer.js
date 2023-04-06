import React from 'react';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';

const getHeaderContent = (children) => {
	children = children.length ? children : children.props && children.props.children;
	const [header, content] = children?.length ? children : [children];
	return {header: content && header, content: content || header};
};
const ContentContainer = ({children, breadCrumbs, dataTour, overFlowX}) => {
	// expecting header and content
	const {header, content} = getHeaderContent(children);

	return (
		<ContainerBox
			data-tour={dataTour}
		>
			{breadCrumbs}
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					{header}
					<div style={{height: '100%', overflowY: 'auto', overflowX: overFlowX}}>
						{content}
					</div>
				</div>
			</div>
		</ContainerBox>
	);
};
export default ContentContainer;
