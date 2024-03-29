import React from 'react';
import { Redirect } from 'react-router-dom';
import Dashboard from './dashboard';
import ToggleModalButton from './ui/add-button';
import Modal from './add-application';
import AppContext from '../lib/context';

class Client extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      applications: null,
      modalOpen: false,
      editingData: null
    };
    this.abortController = new AbortController();
    this.updateApplications = this.updateApplications.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }
  toggleModal(e, data) {
    const { modalOpen } = this.state;
    this.setState({ modalOpen: !modalOpen, editingData: data || null });
  }
  getApplications() {
    fetch('/api/applications', {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: this.abortController.signal
    })
      .then(res => res.json())
      .then(applications => this.setState({ applications }))
      .catch(err => console.warn(err));
  }
  updateApplications(data, id, del) {
    const { applications } = this.state;
    if (del) {
      const apps = applications.filter(item => item.id !== id);
      this.setState({ applications: apps });
      return;
    }
    if (id) {
      data.id = id;
      applications.unshift(data);
      this.setState({ applications });
      return;
    }
    const index = applications.findIndex(item => item.id === data.id);
    applications[index] = data;
    this.setState({ applications });
  }
  componentDidMount() {
    this.getApplications();
  }
  componentWillUnmount() {
    this.abortController.abort();
  }
  render() {
    const { modalOpen, editingData, applications } = this.state;
    if (!this.context.isLoggedIn()) {
      return (
        <Redirect to="/login"/>
      );
    }
    return (
      <>
        <Dashboard applications={applications} toggleModal={this.toggleModal}/>
        <Modal updateApplications={this.updateApplications} open={modalOpen} editingData={editingData} toggleModal={this.toggleModal}/>
        <ToggleModalButton open={modalOpen} toggleModal={this.toggleModal} />
      </>
    );
  }
}

Client.contextType = AppContext;

export default Client;
