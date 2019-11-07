import React from "react";
import Form from "../components/common/form";
import Categories from "../components/common/categories";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Joi from "joi-browser";
import {
  createCategory,
  updateCategoryById,
  getCategories
} from "../services/categoryService";
class CategoryForm extends Form {
  state = {
    data: {
      name: "",
      parentCategory: "",
      hasChild: "false"
    },
    errors: {}
  };
  schema = {
    name: Joi.string()
      .min(4)
      .required(),
    parentCategory: Joi.string(),
    hasChild: Joi.boolean()
  };
  async componentDidMount() {
    const { data: allCategories } = await getCategories();
    this.setState({ allCategories });
    this.populateForm(this.props.category, allCategories);
  }
  populateForm = (category, allCategories) => {
    let { data } = this.state;
    let parentCategoryName = null;
    if (this.props.requestType === "addChild") {
      data.parentCategory = category._id;
      parentCategoryName = this.getparentCategoryName(category._id).name;
    } else if (this.props.requestType === "edit") {
      data.name = category.name;
      data.hasChild = category.hasChild;
      if (category.parentCategory) {
        data.parentCategory = category.parentCategory;
        parentCategoryName = this.getparentCategoryName(category.parentCategory)
          .name;
      }
    } else if (this.props.requestType === "new") {
      data.hasChild = false;
      data.parentCategory = allCategories.find(c => c.name === "Root")._id;
    }
    this.setState({
      data,
      requestType: this.props.requestType,
      parentCategoryName,
      category
    });
  };

  getparentCategoryName = id => {
    let parentCategory = this.state.allCategories.find(c => c._id === id);
    return parentCategory;
  };
  handleOnCategorySeletion = id => {
    let { data } = this.state;
    data.parentCategory = id;
    let parentCategoryName = this.getparentCategoryName(id).name;
    this.setState({
      data,
      parentCategoryName,
      showCategoriesDialog: false
    });
  };

  doSubmit = async () => {
    try {
      let category = null;
      if (this.state.requestType === "edit") {
        let { data } = await updateCategoryById(
          this.state.category._id,
          this.state.data
        );
        category = data;
      } else if (this.state.requestType === "addChild") {
        let { data } = await createCategory(this.state.data);
        category = data;
      } else if (this.state.requestType === "new") {
        let { data } = await createCategory(this.state.data);
        category = data;
      }
      this.props.onSubmitForm(category);
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <React.Fragment>
        <Dialog
          open={this.props.isOpen}
          onClose={this.props.onClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          scroll={"paper"}
          height="500px"
        >
          <DialogTitle id="form-dialog-title">Category</DialogTitle>
          <form onSubmit={this.handleSubmit}>
            <DialogContent dividers={true}>
              <div className="card-body sahdow-lg">
                {this.renderInput("name", "Category Name")}
                <label className="d-inline-block">Parent Category</label>
                <div className=" ml-3 d-inline-block">
                  {this.renderCategoriesDialogButton(
                    this.handleCategoryDialogButton,
                    false,
                    this.state.parentCategoryName
                      ? this.state.parentCategoryName
                      : "Root Category",
                    this.props.requestType === "addChild"
                  )}
                </div>
                <Categories
                  isLoading={true}
                  onCategorySeletion={this.handleOnCategorySeletion}
                  isOpen={this.state.showCategoriesDialog}
                  onClose={this.handleDialogClose}
                  isCrud={true}
                />
              </div>
            </DialogContent>
            <DialogActions>
              {this.renderButton("Submit")}
              <button
                className="btn btn-primary rounded-pill"
                onClick={this.props.onClose}
              >
                Close
              </button>
            </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default CategoryForm;