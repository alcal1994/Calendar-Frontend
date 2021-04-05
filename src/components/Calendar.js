import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, DatePicker, Row, Col, Divider } from 'antd';
import moment from 'moment';
import '../Calendar.css';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import { PlusCircleOutlined } from '@ant-design/icons';
 
const CalendarComponent = () => {

  //set component variables
  const [visible, setVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState();
  const [modalType, setModalType] = useState();
  const [events, setEvents] = useState();

  //get bookings upon component mount
  useEffect(() => {
    axios({
      method: 'get',
      url: '/booking',
    }).then((response) => {
      setEvents(response.data);
    })
   .catch((error)=>{
      console.log(error);
   });
  },[])

  //when the modal closes, clear selectedBooking object
  useEffect(() => {
    if(visible === false){
      setSelectedBooking(null);
    }
  },[visible]);


  //handle clicking of calendar events
  const clickEvent = (event) => { 
    console.log(event);
      setSelectedBooking({
        _id: event.event._def.extendedProps._id,
        title: event.event._def.title,
        note: event.event._def.extendedProps.note,
        start: moment(event.event.startStr),
        end: moment(event.event.endStr)
      })
    setModalType("Edit")
    setVisible(true);
  }

  //update variables when add booing button is pressed
  const addBooking = () => { 
    setModalType("Add")
    setVisible(true);
  }
  //form layout
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  //form layout
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onFinish = (values) => {
    //add data to database
    if(modalType === 'Add'){
      axios({
        method: 'post',
        url: '/booking',
        data: values
      });
      events.push(values);
    //edit data in database
    }else if(modalType === 'Edit'){
      axios({
        method: 'put',
        url: `/booking/${selectedBooking._id}`,
        data: values
      });
    }

    //fetch data from api once data has either been updated or added
    axios({
      method: 'get',
      url: '/booking',
    }).then((response) => {
      setEvents(response.data);
    })
   .catch((error)=>{
      console.log(error);
   });
  };

  const deleteBooking = () => {
    //delete booking
    axios({
      method: 'delete',
      url: `/booking/${selectedBooking._id}`,
    });

    //fetch updated data from api
    axios({
      method: 'get',
      url: '/booking',
    }).then((response) => {
      setEvents(response.data);
    })
   .catch((error)=>{
      console.log(error);
   });

   //close modal
   setVisible(false);
  }

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const config = {
    rules: [
      {
        type: 'object',
        required: true,
        message: 'Please select time!',
      },
    ],
  };
 
  return (
      <div class="calendar-wrapper">
        <FullCalendar
        plugins={[ dayGridPlugin, interactionPlugin ]}
        initialView="dayGridMonth"
        height={700}
        selectable={true}
        events={events}
        eventClick={clickEvent}
      />
      <Modal
        title={modalType}
        visible={visible}
        onCancel={() => setVisible(false)}
        destroyOnClose
        footer={[
        ]}
      >
        <Form 
          {...layout} 
          name="nest-messages" 
          onFinish={onFinish} 
          validateMessages={validateMessages}
          initialValues={{
            'title': selectedBooking?.title,
            'note': selectedBooking?.note,
            'start': selectedBooking?.start,
            'end': selectedBooking?.end
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="note"
            label="Note"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="start" label="Start" {...config}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="end" label="End" {...config}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Divider></Divider>
          <Row gutter={6} justify="center">
            <Col span={5}>
                <Button 
                  style={{
                      float: 'right'
                    }} 
                    type="primary" 
                    htmlType="submit"
                    onClick={() => setVisible(false)}
                >
                  Submit
                </Button>
              </Col>
              {(modalType === 'Edit') && (
              <Col span={5}>
                <Button type="danger" style={{float: "right"}} onClick={deleteBooking}>
                  Delete 
                </Button>
              </Col>
              )}
            </Row>
        </Form>
      </Modal>
      <br />
      <Button style={{float: "right"}} type="primary" size="large" icon={<PlusCircleOutlined />} onClick={addBooking}>
        Add Booking
      </Button>
    </div>
  );
};
 
export default CalendarComponent;