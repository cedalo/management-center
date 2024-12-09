import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    breadcrumbItem: theme.palette.breadcrumbItem,
    breadcrumbLink: theme.palette.breadcrumbLink,
}));

export default function ConnectionBreadCrumbs({ links, title }) {
    const classes = useStyles();

    return (
        <div>
            <Breadcrumbs aria-label="breadcrumb">
                {links &&
                    links.map((link) => (
                        <RouterLink className={classes.breadcrumbLink} to={link.route}>
                            {link.name}
                        </RouterLink>
                    ))}
                <span className={classes.breadcrumbItem}>{title}</span>
            </Breadcrumbs>
        </div>
    );
}
