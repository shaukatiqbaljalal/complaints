import React, { Component } from "react";
import Childs from "./child";
import Category from "./category";
import { Accordion } from "react-bootstrap";
import uuid from "uuid";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import PlainCategoryForm from "./PlainCategoryForm";
import { toast } from "react-toastify";
import { insertMultipleCategories } from "../services/categoryService";
class TemporaryCategoriesList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: ""
  };
  constructor(props) {
    super(props);
    this.state.allCategories = props.categories;
  }

  //intializing the thereExists with props coming from parent
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      thereExistsError: nextProps.thereExistsError
    });
  }
  async componentDidMount() {
    // if (this.state.allCategories.length < 1) {
    //   const { data: allCategories } = await getCategories();
    //   // const { data: categories } = await getCategoriesWithNoParent();
    //   let categories = allCategories.filter(c => c.name !== "Root");
    //   this.setState({ allCategories: categories });
    // }
  }

  onDragStart = (ev, categoryId) => {
    console.log("Category being dragged", categoryId);
    ev.dataTransfer.setData("categoryId", categoryId);
  };

  onDragOver = ev => {
    ev.preventDefault();
  };

  onDrop = async event => {
    event.preventDefault();
    event.stopPropagation();
    const categoryId = event.dataTransfer.getData("categoryId");
    const parentCategoryId = event.target.id;
    console.log("Category that is going to be parent", parentCategoryId);
    console.log("Dropped categoy id", categoryId);
    const { allCategories } = this.state;
    console.log(allCategories);
    const categoryToUpdate = allCategories.find(
      category => category._id == categoryId
    );
    console.log(categoryToUpdate);
    //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    const oldSiblings = this.doesHaveSiblings(categoryToUpdate);

    //agar old parent ka child koi ni hai
    if (!oldSiblings) {
      //oldPArent should have hasChild false
      if (categoryToUpdate.parentCategory)
        allCategories.map(category => {
          if (category._id == categoryToUpdate.parentCategory)
            category.hasChild = false;

          return category;
        });
    }

    //agar null har matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      allCategories.map(c => {
        if (c._id == categoryId) delete c.parentCategory;
        return c;
      });
      this.setState({ allCategories });
      return;
    }
    //agar null ni hai tou check karo khud ko khud pay drop kar raha h? do nothing
    if (categoryId == parentCategoryId) return;
    //check karo k kya dobara usi parent ka child ban raha hai? do nothing
    if (categoryToUpdate.parentCategory == parentCategoryId) return;

    const categoryTobeParent = allCategories.find(
      category => category._id == parentCategoryId
    );
    console.log("dragged category", categoryToUpdate);
    console.log("Category going to be parent ", categoryTobeParent);

    if (parentCategoryId) {
      categoryToUpdate.parentCategory = parentCategoryId;
      categoryTobeParent.hasChild = true;
    } else {
      delete categoryToUpdate.parentCategory;
    }

    console.log("Sending body", categoryToUpdate);

    allCategories.map(c => {
      if (c._id == categoryToUpdate._id) c = categoryToUpdate;
      return c;
    });
    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);

    this.setState({ allCategories });
  };

  doesHaveSiblings = category => {
    console.log(category, " The category I am tring to check who has siblings");
    if (!category.parentCategory) return false;

    const { allCategories } = this.state;
    const siblings = allCategories.filter(
      c => c.parentCategory == category.parentCategory
    );
    console.log("length of siblings before", siblings.length);
    if (siblings.length > 1) return true;
    return false;
  };

  handleSubmitCategoryForm = category => {
    let { allCategories } = this.state;

    if (category) {
      if (category.parentCategory === "0") {
        delete category.parentCategory;
      }
      if (this.state.requestType === "edit") {
        let cIndex = allCategories.findIndex(c => c._id == category._id);
        allCategories[cIndex] = category;
      } else if (this.state.requestType === "addChild") {
        allCategories.push(category);
        let cIndex = allCategories.findIndex(
          c => c._id == category.parentCategory
        );
        console.log(cIndex);
        if (cIndex >= 0) allCategories[cIndex].hasChild = true;
      } else {
        allCategories.push(category);
      }
      this.setState({ allCategories, categoryFormEnabled: false });
    } else {
      this.setState({ categoryFormEnabled: false });
    }
    // window.location.reload();
  };
  handleCloseCategoryForm = () => {
    this.setState({ categoryFormEnabled: false });
  };
  handleNewCategory = () => {
    this.setState({ requestType: "new", categoryFormEnabled: true });
  };

  handleEditCategory = category => {
    this.setState({
      selectedCategory: category,
      categoryFormEnabled: true,
      requestType: "edit"
    });
  };
  handleAddChild = category => {
    this.setState({
      selectedCategory: category,
      categoryFormEnabled: true,
      requestType: "addChild"
    });
  };

  handleDeleteCategory = async category => {
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              if (!category.hasChild) {
                // await deleteCategory(category._id);
                let { allCategories } = this.state;
                let updated = allCategories.filter(c => c._id !== category._id);
                if (category.parentCategory) {
                  if (!this.doesHaveSiblings(category)) {
                    let parentIndex = allCategories.findIndex(
                      c => c._id == category.parentCategory
                    );
                    if (parentIndex >= 0)
                      allCategories[parentIndex].hasChild = false;
                  }
                }
                this.setState({ allCategories: updated });
              } else {
                toast.warn(
                  "We are sorry its not leaf node. Please adjust its decendents first then delete it."
                );
              }
            } catch (error) {
              console.log(error);
            }
          }
        },
        {
          label: "No"
        }
      ]
    });
  };

  checkErrors = () => {
    const { allCategories } = this.state;
    let thereExistsError = allCategories.filter(c => c.error);
    if (thereExistsError.length > 0)
      alert("There exists " + thereExistsError.length + " error(s)");
    else alert("There are no errors.Now Click SAVE button");
    this.setState({
      thereExistsError: thereExistsError.length > 0 ? true : false
    });
  };

  handleSave = async () => {
    if (this.state.thereExistsError) {
      alert(
        "Kindly solve errors of yellow categories first then hit save. To see errors CLICK on category. If there is no yellow category but still seeing this then CLICK Check for Errors button."
      );
      return;
    }
    try {
      await insertMultipleCategories(this.state.allCategories);
      toast.success("Categories successfully created.");
      if (!this.props.isStepper) window.location = "/admin/users/categories";
    } catch (error) {
      toast.error("Something wrong occured. Please try again.");
    }
  };

  render() {
    const { allCategories } = this.state;
    const rootCategories = allCategories.filter(c => !c.parentCategory);
    const length = rootCategories.length;

    return (
      <div className="container card p-1  ">
        <div className="card-header">
          <p className="h5">All categories</p>
        </div>
        <div className="card-body">
          <div className="d-flex">
            <button
              className="btn button-secondary rounded-pill mb-3 mr-auto"
              onClick={this.handleNewCategory}
            >
              Create Category...
            </button>

            {this.state.allCategories.length > 0 && (
              <div>
                <button
                  className="btn button-secondary rounded-pill  mb-3 mr-auto"
                  onClick={this.checkErrors}
                >
                  Check for Errors
                </button>
                <button
                  className="btn btn-primary btn-round mb-3 ml-1"
                  onClick={this.handleSave}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          {this.state.allCategories.length > 0 ? (
            <Accordion defaultActiveKey="">
              <div
                className="p-3 shadow-lg"
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
                id={null}
              >
                {length > 0 &&
                  rootCategories.map(category =>
                    category.hasChild ? (
                      <div key={category._id + "parent"}>
                        <Category
                          key={uuid()}
                          category={category}
                          onEdit={this.handleEditCategory}
                          onAddChild={this.handleAddChild}
                          onDelete={this.handleDeleteCategory}
                          onDragStart={this.onDragStart}
                        />
                        <Childs
                          key={uuid()}
                          category={category}
                          onEdit={this.handleEditCategory}
                          onAddChild={this.handleAddChild}
                          onDelete={this.handleDeleteCategory}
                          allCategories={allCategories}
                          onDragOver={this.onDragOver}
                          onDrop={this.onDrop}
                          onDragStart={this.onDragStart}
                        />
                      </div>
                    ) : (
                      <div
                        onDragOver={this.onDragOver}
                        id={category._id}
                        onDrop={this.onDrop}
                        key={category._id + "single"}
                      >
                        <Category
                          key={uuid()}
                          category={category}
                          onEdit={this.handleEditCategory}
                          onAddChild={this.handleAddChild}
                          onDelete={this.handleDeleteCategory}
                          onDragOver={this.onDragOver}
                          onDragStart={this.onDragStart}
                        />
                      </div>
                    )
                  )}
              </div>
            </Accordion>
          ) : (
            <p>
              Select one of two methods i.e{" "}
              <u>
                <strong>CSV or Create Category</strong>
              </u>{" "}
              button to create categories.
            </p>
          )}
        </div>
        {this.state.categoryFormEnabled && (
          <PlainCategoryForm
            requestType={this.state.requestType}
            category={this.state.selectedCategory}
            isOpen={this.state.categoryFormEnabled}
            onSubmitForm={this.handleSubmitCategoryForm}
            allCategories={allCategories}
            onClose={this.handleCloseCategoryForm}
          />
        )}
      </div>
    );
  }
}

export default TemporaryCategoriesList;
