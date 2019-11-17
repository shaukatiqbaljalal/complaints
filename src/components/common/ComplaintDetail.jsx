import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  taskAssignment,
  changeStatus,
  giveFeedback
} from "../../services/complaintService";
import { getAllAssignees } from "../../services/assigneeService.js";
import { toast } from "react-toastify";
import Users from "../admin/usersManagement/users";
import { DialogTitle, Grow } from "@material-ui/core";
import Loading from "./loading";
import { getCurrentUser } from "../../services/authService";
import "./complaintDetail.css";
import { capitalizeFirstLetter } from "../../services/helper";
import { getConfigToken } from "../../services/configurationService";

export default function ComplaintDetail(props) {
  const [openAssigneeDialog, setopenAssigneeDialog] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [displayAssignees, setDisplayAssignees] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const [remarks, setRemarks] = useState("");
  const statusValue = useRef(null);
  let isMessaging = false;
  const [displayFeedback, setDisplayFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    feedbackRemarks: "",
    feedbackTags: ""
  });
  // const [categories, setCategories] = useState([]);

  useEffect(() => {
    setComplaint(props.complaint);
    let currentUser = getCurrentUser();
    let configToken = getConfigToken();
    if (configToken) isMessaging = configToken.isMessaging;
    if (!currentUser) window.location = "/login";
    setUser(currentUser);
  }, []);

  function calculateDays() {
    var date = new Date(complaint.timeStamp);
    let d = new Date();
    let da = (
      Math.ceil(Math.abs(d.getTime() - date.getTime()) / (1000 * 3600 * 24)) - 1
    ).toString();
    if (da === "0") {
      return <>Today</>;
    } else {
      return <>{da} day(s) ago</>;
    }
  }

  // getting all assignees
  const getAssignees = async () => {
    const { data: assignees } = await getAllAssignees();
    setAssignees(assignees);
  };

  // handle close assignee selection dialog
  function handleCloseAssigneeDialog() {
    setopenAssigneeDialog(false);
  }

  //handle Assign complaint
  const handleAssign = async complaint => {
    setopenAssigneeDialog(true);
    setDisplayAssignees(true);
    getAssignees();
  };

  const handleMapView = () => {
    window.open(
      `https://www.google.com/maps/@${complaint.geolocation.lat},${complaint.geolocation.lng},15z`,
      "_blank"
    );
  };

  // handle file download
  const handleFileDownload = async complaint => {
    window.location =
      "http://localhost:5000/api/complainer-complaints/download/image/" +
      complaint._id;
  };

  // handle file download
  const handleFileView = async complaint => {
    window.open(
      "http://localhost:5000/api/complainer-complaints/view/image/" +
        complaint._id,
      "_blank"
    );
  };

  // handle Edit
  const handleEdit = () => {
    if (user._id !== complaint.assignedTo._id) return;
    setEdit(pre => !pre);
  };

  // handle save
  const handleSave = async id => {
    const value = statusValue.current.value;

    if (remarks.length < 20) {
      return setError("Remarks length should be atleast 20 charaters long.");
    }
    try {
      const { data: complaint } = await changeStatus(id, value, remarks);
      setEdit(false);
      setComplaint(complaint);
    } catch (error) {
      toast.error("Could not change the status");
    }
    // window.location = `/assignee/${complaint._id}`;
  };

  // handle remarks
  const handleRemarks = ({ currentTarget: input }) => {
    setRemarks(input.value);
  };

  const handleUserSelected = user => {
    setAssignees(user);
    setopenAssigneeDialog(false);
    handleAssignTask(user);
  };

  // handle Assign Task
  const handleAssignTask = async user => {
    const { data: newcomplaint } = await taskAssignment(
      complaint._id,
      user._id
    );
    setComplaint(newcomplaint);
    // props.history.replace("/admin");
    toast.success("Complaint is successfully assigned.");
  };

  // handle Messaging
  const handleMessaging = async complaint => {
    console.log("handle messaging", complaint);
    let route =
      user.role === "complainer"
        ? `/c/message/${complaint.assignedTo._id}`
        : `/a/message/${complaint.complainer._id}`;
    window.location = route;
  };

  // feedback functions

  // handle feedback
  const handleFeedbackArea = ({ currentTarget: input }) => {
    setFeedback({ feedbackRemarks: input.value });
    setError("");
  };

  // handle satisfaction -- yes
  const handleSatisfaction = () => {
    setFeedback({ ...feedback, feedbackTags: "yes" });
    console.log(feedback.feedbackRemarks);
  };

  // handle not satisfaction -- not
  const handleDisSatisfaction = () => {
    setFeedback({ ...feedback, feedbackTags: "no" });
    console.log(feedback.feedbackRemarks);
  };

  // handle feedback completion
  const handleGiveFeedback = async (id, e) => {
    e.preventDefault();
    if (feedback.feedbackRemarks === "" || feedback.feedbackTags === "") {
      return setError("Please write feedback and choose your satisfaction");
    }
    await giveFeedback(id, feedback);
    setError("");
    setDisplayFeedback(false);
    toast.success("Thankyou for your Feedback");
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={props.onClose}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        TransitionComponent={Grow}
        // TransitionComponent={Transition}
        fullWidth={true}
        scroll={"paper"}
      >
        <div
          className="p-0 m-0"
          style={{
            height: "600px",
            position: "relative",
            backgroundColor: "aliceblue"
          }}
        >
          {!complaint ? (
            <Loading />
          ) : (
            <>
              <div className=" complaint-header">
                <div className="days">{calculateDays()}</div>
                <div className="complaintControls rounded-pill d-flex  justify-content-end">
                  {/* //Buttons Section  */}
                  {user._id === complaint.complainer._id &&
                    complaint.status !== "in-progress" &&
                    !complaint.feedbackRemarks && (
                      <i
                        className="fa fa-comments-o controlIcon"
                        onClick={() => setDisplayFeedback(true)}
                      ></i>
                    )}

                  {/* The person who is responsible or complainer can start  or see chat */}
                  {isMessaging &&
                    (user._id === complaint.complainer._id ||
                      user._id === complaint.assignedTo._id) && (
                      <i
                        className="fa fa-envelope controlIcon"
                        onClick={() => handleMessaging(complaint)}
                      ></i>
                    )}

                  {/* Assign Task */}
                  {!complaint.assignedTo && user.role === "admin" && (
                    <i
                      className="fa fa-user controlIcon"
                      onClick={() => handleAssign(complaint)}
                    ></i>
                  )}

                  {complaint.files !== "" && (
                    <>
                      <i
                        className="fa fa-paperclip controlIcon"
                        onClick={() => handleFileView(complaint)}
                      ></i>
                      <i
                        className="fa fa-download controlIcon"
                        onClick={() => handleFileDownload(complaint)}
                      ></i>
                    </>
                  )}

                  {complaint.geolocation && (
                    <i
                      className="fa fa-map-marker controlIcon"
                      onClick={() => handleMapView(complaint)}
                    ></i>
                  )}
                </div>

                {/* Header DAta  Section */}

                <h3 className="">{complaint.title}</h3>
                <div className="d-flex justify-content-between">
                  <label className="userLabel">
                    Complainer:
                    <span className="userName">
                      {complaint.complainer.name}
                    </span>
                  </label>
                  <label className="userLabel">
                    Assigned To:{" "}
                    <span className="userName">
                      {complaint.assignedTo
                        ? complaint.assignedTo.name
                        : "Admin"}
                    </span>
                  </label>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="status" onClick={handleEdit}>
                    Status: {complaint.status}
                  </span>
                  <span className="complaintCategory">
                    Category: {complaint.category.name}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className={`severity ${complaint.severity}-severity`}>
                    Severity: {complaint.severity}
                  </span>
                </div>
              </div>
              <div className=" complaint-body d-flex justify-content-center ">
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <label className="userLabel">Location</label>
                      </td>
                      <td>
                        <p className="paragraph">{complaint.location}</p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="userLabel">Description</label>
                      </td>{" "}
                      <td>
                        <p className="paragraph">{complaint.details}</p>
                      </td>{" "}
                    </tr>

                    {complaint.remarks && (
                      <tr>
                        <td>
                          <label className="userLabel">Remarks</label>
                        </td>
                        <p className="paragraph">{complaint.remarks}</p>
                      </tr>
                    )}
                    {complaint.feedbackRemarks && (
                      <tr>
                        <td>
                          <label className="userLabel">Feedback</label>
                        </td>
                        <p className="paragraph">
                          <p className="badge badge-info">
                            <strong>
                              {capitalizeFirstLetter(complaint.feedbackTags)}
                            </strong>
                          </p>
                          <br />

                          {complaint.feedbackRemarks}
                        </p>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {displayAssignees && (
        <Dialog
          open={openAssigneeDialog}
          onClose={handleCloseAssigneeDialog}
          aria-labelledby="form-dialog-title"
          maxWidth="lg"
          fullWidth={true}
        >
          <DialogContent>
            <Users
              type="assignees"
              isAssigning={true}
              onUserSelected={handleUserSelected}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseAssigneeDialog} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {edit && (
        <Dialog
          open={edit}
          onClose={handleEdit}
          aria-labelledby="form-dialog-title"
          maxWidth="sm"
          fullWidth={true}
        >
          <DialogTitle>Change Status</DialogTitle>
          <DialogContent>
            <div className="form-group d-inline">
              <select
                className="form-control-sm"
                name="editOptions"
                id="editOption"
                ref={statusValue}
              >
                <option
                  value="in-progress"
                  selected={complaint.status === "in-progress"}
                >
                  in-progress
                </option>
                <option
                  value="closed - relief granted"
                  selected={complaint.status === "closed - relief granted"}
                >
                  closed - relief granted
                </option>
                <option
                  value="closed - partial relief granted"
                  selected={
                    complaint.status === "closed - partial relief granted"
                  }
                >
                  closed - partial relief granted
                </option>
                <option
                  value="closed - relief can't be granted"
                  selected={
                    complaint.status === "closed - relief can't be granted"
                  }
                >
                  closed - relief can't be granted
                </option>
              </select>
            </div>
            <div className="form-group mt-4">
              <textarea
                className="form-control"
                name="remarks"
                id="remarks"
                value={remarks}
                onChange={e => handleRemarks(e)}
                cols="10"
                rows="5"
                placeholder="Your remarks..."
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}'
          </DialogContent>
          <DialogActions>
            <button
              className="btn button-primary"
              onClick={() => {
                handleSave(complaint._id);
              }}
            >
              Save
            </button>
          </DialogActions>
        </Dialog>
      )}

      <>
        <Dialog
          open={displayFeedback}
          onClose={() => {
            setDisplayFeedback(false);
          }}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          <div className="text-center">
            <DialogTitle id="form-dialog-title">
              Rate this complaint resolution
            </DialogTitle>
            <p className="text-muted text-center">Please write your feedback</p>
          </div>
          <div className="container">
            <div className="form-group mt-4">
              <textarea
                className="form-control"
                name="feedback"
                id="feedback"
                value={feedback.feedbackRemarks}
                onChange={e => handleFeedbackArea(e)}
                cols="5"
                rows="2"
                minLength="5"
                placeholder="Write feedback here..."
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <hr />
            <label htmlFor="">
              Are you satisfied with the complaint resolution?
            </label>
            <br />
            <div className="btn-group" role="group">
              <button
                type="button"
                onClick={handleSatisfaction}
                className={
                  feedback.feedbackTags === "yes"
                    ? "btn btn-success"
                    : "btn btn-light"
                }
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleDisSatisfaction}
                className={
                  feedback.feedbackTags === "no"
                    ? "btn btn-danger"
                    : "btn btn-light"
                }
              >
                No
              </button>
            </div>
            <DialogActions>
              <Button
                onClick={() => {
                  setDisplayFeedback(false);
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={e => handleGiveFeedback(complaint._id, e)}
                color="primary"
              >
                Submit
              </Button>
            </DialogActions>
          </div>
        </Dialog>
      </>
    </>
  );
}
