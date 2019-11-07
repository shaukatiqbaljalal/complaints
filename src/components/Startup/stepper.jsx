import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Check from "@material-ui/icons/Check";
import SettingsIcon from "@material-ui/icons/Settings";
import StepConnector from "@material-ui/core/StepConnector";
import Button from "@material-ui/core/Button";
import Members from "../admin/Higher Authorities/Members";
import AdminForm from "../common/adminForm";
import Features from "../admin/Configuration/Features";
import Attachments from "../admin/Attachments/Attachments";
import RegisterForm from "../admin/usersManagement/Register";
import FileUpload from "../admin/usersManagement/fileUpload";
import CompanyDetailsForm from "../common/companyDetailsForm";
import { Link } from "react-router-dom";
import {
  Details,
  PersonAdd,
  FormatListBulleted,
  Work,
  SupervisedUserCircleRounded,
  Attachment
} from "@material-ui/icons";
import CategoriesRenderer from "../../categories/CategoriesRenderer";
import { getConfiguration } from "../../services/configurationService";

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center"
  },
  active: {
    color: "#784af4"
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor"
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18
  }
});

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active
      })}
    >
      {completed ? (
        <Check className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool
};

const ColorlibConnector = withStyles({
  alternativeLabel: {
    top: 22
  },
  active: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
    }
  },
  completed: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
    }
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1
  }
})(StepConnector);

const useColorlibStepIconStyles = makeStyles({
  root: {
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center"
  },
  active: {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)"
  },
  completed: {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)"
  }
});

function ColorlibStepIcon(props) {
  const classes = useColorlibStepIconStyles();
  const { active, completed } = props;

  const icons = {
    1: <Details />,
    2: <PersonAdd />,
    3: <SettingsIcon />,
    4: <FormatListBulleted />,
    5: <Attachment />,
    6: <Work />,
    7: <SupervisedUserCircleRounded />
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.node
};

const useStyles = makeStyles(theme => ({
  root: {
    width: "90%"
  },
  button: {
    marginRight: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function getSteps() {
  return [
    "Company Details",
    "Admin Account",
    "Features",
    "Categories",
    "Allowed Attachments",
    "Higher Authority Members",
    "Users registration"
  ];
}

function getStepContent(step, match) {
  switch (step) {
    case 0:
      return (
        <div className=" d-flex justify-content-center align-items-center">
          <CompanyDetailsForm />
        </div>
      );
    case 1:
      return (
        <div className=" d-flex justify-content-center align-items-center">
          <AdminForm />
        </div>
      );
    case 2:
      return <Features />;
    case 3:
      return <CategoriesRenderer />;
    case 4:
      return <Attachments />;
    case 5:
      return <Members />;
    case 6:
      return (
        <div className="d-flex justify-content-around flex-wrap">
          <RegisterForm stepper={true} />
          <FileUpload />
        </div>
      );
    default:
      return "Unknown step";
  }
}

export default function CustomizedSteppers({ match }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(6);
  const steps = getSteps();

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }

  function handleReset() {
    setActiveStep(0);
  }
  useEffect(async () => {
    try {
      await getConfiguration();
      window.location = "/login";
    } catch (error) {}
  }, []);
  return (
    <div className={classes.root}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <div className={classes.instructions}>
              <h4>Congratulations</h4>
              <p>
                You are good to go. Now you may login to your account and use
                our product.{" "}
              </p>
            </div>
            <Link to={"/login"}>Go to Login</Link>
          </div>
        ) : (
          <div>
            <div className={classes.instructions}>
              {getStepContent(activeStep, match)}
            </div>
            <div className="mt-3">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}