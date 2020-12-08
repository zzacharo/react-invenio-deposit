// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Grid, Header, Menu, Form } from 'semantic-ui-react';
import {
  ReactSearchKit,
  SearchBar,
  InvenioSearchApi,
  Toggle,
  ResultsLoader,
  EmptyResults,
  Error,
} from 'react-searchkit';
import { OverridableContext } from 'react-overridable';
import { LicenseFilter } from './LicenseFilter';
import { LicenseResults } from './LicenseResults';
import { Formik } from 'formik';
import { TextAreaField, TextField, ActionButton } from 'react-invenio-forms';

const overriddenComponents = {
  'SearchFilters.ToggleComponent': LicenseFilter,
};

const ModalTypes = {
  STANDARD: 'standard',
  CUSTOM: 'custom',
};

const ModalActions = {
  ADD: 'add',
  EDIT: 'edit',
};

export class LicenseModal extends Component {
  state = {
    open: false,
  };

  openModal = () => {
    this.setState({ open: true });
  };

  closeModal = () => {
    this.setState({ open: false });
  };

  onSubmit = (values, formikBag) => {
    this.props.onLicenseChange(values.selectedLicense);
    formikBag.setSubmitting(false);
    formikBag.resetForm();
    // this.props.onClose();
    this.closeModal();
  };

  render() {
    const initialLicense = this.props.initialLicense || {
      title: '',
      description: '',
      id: null,
    };
    const searchApi = new InvenioSearchApi(this.props.searchConfig.searchApi);
    return (
      <Formik
        initialValues={{
          selectedLicense: initialLicense,
        }}
        onSubmit={this.onSubmit}
      >
        <Modal
          onOpen={() => this.openModal()}
          open={this.state.open}
          trigger={this.props.trigger}
          onClick={(e) => {
            // NOTE: temporary fix for https://github.com/Semantic-Org/Semantic-UI-React/issues/3174
            e.stopPropagation();
          }}
          closeOnDimmerClick={false}
        >
          <Modal.Header as="h6" className="license-modal-header">
            <Grid>
              <Grid.Column floated="left" width={4}>
                <Header as="h2">
                  {this.props.action === ModalActions.ADD
                    ? 'Add License'
                    : 'Change License'}
                </Header>
              </Grid.Column>
              <Grid.Column
                width={6}
                floated="right"
                textAlign="right"
                verticalAlign="bottom"
              >
                <Header as="h6">
                  <a href="/">How to choose a license?</a>
                </Header>
              </Grid.Column>
            </Grid>
          </Modal.Header>
          <Modal.Content>
            {this.props.mode === ModalTypes.STANDARD && (
              <OverridableContext.Provider value={overriddenComponents}>
                <ReactSearchKit
                  searchApi={searchApi}
                  appName={'licenses'}
                  urlHandlerApi={{ enabled: false }}
                  initialQueryState={this.props.searchConfig.initialQueryState}
                >
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={8} floated="left">
                        <SearchBar
                          autofocus
                          actionProps={{
                            icon: 'search',
                            content: null,
                            className: 'search',
                          }}
                        />
                      </Grid.Column>
                      <Grid.Column width={8} textAlign="right" floated="right">
                        <Button.Group>
                          <Menu>
                            <Toggle
                              title="Recommended"
                              label="recommended"
                              filterValue={['type', 'recommended']}
                            ></Toggle>
                            <Toggle
                              title="All"
                              label="all"
                              filterValue={['type', 'all']}
                            ></Toggle>
                            <Toggle
                              title="Data"
                              label="data"
                              filterValue={['type', 'data']}
                            ></Toggle>
                            <Toggle
                              title="Software"
                              label="software"
                              filterValue={['type', 'software']}
                            ></Toggle>
                          </Menu>
                        </Button.Group>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row verticalAlign="middle">
                      <Grid.Column>
                        <ResultsLoader>
                          <EmptyResults />
                          <Error />
                          <LicenseResults />
                        </ResultsLoader>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </ReactSearchKit>
              </OverridableContext.Provider>
            )}
            {this.props.mode === ModalTypes.CUSTOM && (
              <Form>
                <TextField
                  label="Title"
                  placeholder="License title"
                  fieldPath="selectedLicense.title"
                ></TextField>
                <TextAreaField
                  fieldPath={'selectedLicense.description'}
                  label={'Description'}
                />
                <TextField
                  label="Link"
                  placeholder="License link"
                  fieldPath="selectedLicense.link"
                ></TextField>
              </Form>
            )}
          </Modal.Content>
          <Modal.Actions>
            <ActionButton
              name="cancel"
              onClick={(values, formikBag) => {
                formikBag.resetForm();
                // this.props.onClose();
                this.closeModal();
              }}
              negative
              icon="remove"
              content="Cancel"
            />
            <ActionButton
              name="submit"
              onClick={(event, formik) => formik.handleSubmit(event)}
              positive
              content={
                this.props.action === ModalActions.ADD
                  ? this.props.mode === ModalTypes.CUSTOM
                    ? 'Create custom License'
                    : 'Add License'
                  : 'Change License'
              }
            />
          </Modal.Actions>
        </Modal>
      </Formik>
    );
  }
}

LicenseModal.propTypes = {
  mode: PropTypes.oneOf(['standard', 'custom']).isRequired,
  action: PropTypes.oneOf(['add', 'edit']).isRequired,
  initialLicense: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  trigger: PropTypes.object.isRequired,
  onLicenseChange: PropTypes.func.isRequired,
  searchConfig: PropTypes.shape({
    searchApi: PropTypes.shape({
      axios: PropTypes.shape({
        headers: PropTypes.object,
      }),
    }).isRequired,
    initialQueryState: PropTypes.shape({
      filters: PropTypes.arrayOf(PropTypes.array),
    }).isRequired,
  }).isRequired,
};
