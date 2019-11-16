import React from "react";
import { Route, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import RegisterForm from "../Register";
import Users from "../users";
import FileUpload from "../fileUpload";
import { getCurrentUser } from "../../../../services/authService";
import UserLogo from "../../../common/logo";
import CategoriesList from "../../../../categories/categoriesList";
import Settings from "../../Configuration/Settings";
import DashboardCards from "../../DashboardCards";
import Dashboard from "../../dashboard/dashboard";
import { Toolbar } from "@material-ui/core";
const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
      background: "blue"
    },
    background: "blue"
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  backgroundColor: "#394362",
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    minHeight: "700px",
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
    padding: theme.spacing(0)
  }
}));

function UserManagement(props) {
  const { container } = props;
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <div
          className="d-flex flex-column align-items-center p-3"
          style={{
            backgroundColor: "#4D5672",
            height: "150px"
          }}
        >
          <UserLogo management={true} />
          <p className="text-white m-0 mt-1">
            {getCurrentUser().name.split(" ")[0]}
          </p>
          <p className="text-white text-center m-0">Admin</p>
        </div>
      </div>
      <Divider />

      <List>
        {[
          {
            label: "Create Account",
            path: "/admin/users/register",
            icon: <i className="fa fa-plus mr-4 fa-2x"></i>
          },
          {
            label: "Assignees",
            path: "/admin/users/assignees",
            icon: <i className="fa fa-list mr-4 fa-2x"></i>
          },
          {
            label: "Complainers",
            path: "/admin/users/complainers",
            icon: <i className="fa fa-list-alt mr-4 fa-2x"></i>
          }
        ].map(item => (
          <Link
            key={item.label}
            className="nav-item nav-link text-dark p-0"
            to={item.path || "/admin"}
            style={{ textDecoration: "none" }}
          >
            <ListItem button key={item.label}>
              {item.icon}
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>

      <Divider />
      <List>
        {[
          {
            label: "Home",
            path: "/admin/users",
            icon: <i className="fa fa-home mr-4 fa-2x"></i>
          },
          {
            label: "Configuration",
            path: "/admin/users/configuration",
            icon: <i className="fa fa-cog mr-4 fa-2x"></i>
          },
          {
            label: "Categories",
            path: "/admin/users/categories",
            icon: <i className="fa fa-list-alt mr-4 fa-2x"></i>
          },

          {
            label: "Logout",
            path: "/logout",
            icon: <i className="fa fa-sign-out mr-4 fa-2x"></i>
          }
        ].map(item => (
          <Link
            key={item.label}
            className="nav-item nav-link text-dark p-0"
            to={item.path || "/admin"}
            style={{ textDecoration: "none" }}
          >
            <ListItem button key={item.label}>
              {item.icon}
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <div className={"d-flex text-center  w-100"}>
            <button>Hello</button>
          </div>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={`${classes.content} container-fluid `}>
        <div className={classes.toolbar} />
        <div>
          <Route path="/admin/users/" exact component={Dashboard} />
          <Route
            path="/admin/users/register"
            exact
            render={props => (
              <div>
                <div className="p-3 border rounded-lg d-flex justify-content-center mb-1 gradiantHeading">
                  <h3 style={{ color: "white" }}>Accounts</h3>
                </div>
                <div className="d-flex justify-content-around flex-wrap">
                  <RegisterForm /> <FileUpload {...props} />
                </div>
              </div>
            )}
          />
        </div>

        <Route
          path="/admin/users/edit/:id/:role"
          render={props => (
            <div>
              <div className="p-3 border rounded-lg d-flex justify-content-center mb-1 gradiantHeading">
                <h3 style={{ color: "white" }}>User</h3>
              </div>
              <div className="d-flex justify-content-around flex-wrap">
                <RegisterForm isEditView={true} {...props} />
              </div>
            </div>
          )}
        />

        {/* <Route
          path="/user/profile/:id/:role"
          render={props => <RegisterForm isProfile={true} />}
        /> */}

        <Route
          path="/admin/users/assignees"
          render={props => <Users type="assignees" {...props} />}
        />
        <Route
          path="/admin/users/complainers"
          render={props => <Users type="complainers" {...props} />}
        />
        <Route path="/admin/users/categories" component={CategoriesList} />
        <Route path="/admin/users/configuration" component={Settings} />
        {/* <Redirect from="/admin/users" to="/admin/users/register" /> */}
      </main>
    </div>
  );
}

UserManagement.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container: PropTypes.object
};

export default UserManagement;
