import * as React from 'react';
import * as PropTypes from 'prop-types';
import { getMessagesFormatter } from '@devexpress/dx-core';
import {
  Plugin,
  Template,
  createStateHelper,
  TemplateConnector,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import {
  setAppointmentData,
  isAllDayCell,
  callActionIfExists,
  changeAppointmentField,
  COMMIT_COMMAND_BUTTON,
  CANCEL_COMMAND_BUTTON,
} from '@devexpress/dx-scheduler-core';

const defaultMessages = {
  allDayLabel: 'All Day',
  titleLabel: 'Title',
  startDateLabel: 'Start Date',
  endDateLabel: 'End Date',
  commitCommand: 'Save',
  cancelCommand: 'Cancel',
};

const pluginDependencies = [
  { name: 'EditingState', optional: true },
  { name: 'Appointments', optional: true },
  { name: 'AppointmentTooltip', optional: true },
];

export class AppointmentForm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.visible,
      appointmentData: props.appointmentData || {},
    };

    const stateHelper = createStateHelper(
      this,
      {
        visible: () => props.onVisibilityChange,
        appointmentData: () => props.onAppointmentDataChange,
      },
    );

    const toggleVisibility = () => {
      const { visible: isOpen } = this.state;
      return !isOpen;
    };
    this.toggleVisibility = stateHelper.applyFieldReducer
      .bind(stateHelper, 'visible', toggleVisibility);
    this.setAppointmentData = stateHelper.applyFieldReducer
      .bind(stateHelper, 'appointmentData', setAppointmentData);

    this.openFormHandler = (appointmentData) => {
      this.setAppointmentData({ appointmentData });
      this.toggleVisibility();
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      visible = prevState.visible,
      appointmentData = prevState.appointmentData,
    } = nextProps;
    return {
      appointmentData,
      visible,
    };
  }

  render() {
    const {
      allDayComponent: AllDayEditor,
      containerComponent: Container,
      scrollableAreaComponent: ScrollableArea,
      staticAreaComponent: StaticArea,
      popupComponent: Popup,
      startDateComponent: StartDateEditor,
      endDateComponent: EndDateEditor,
      titleComponent: TitleEditor,
      commandButtonComponent: CommandButton,
      readOnly,
      messages,
    } = this.props;
    const { visible, appointmentData } = this.state;

    const getMessage = getMessagesFormatter({ ...defaultMessages, ...messages });
    return (
      <Plugin
        name="AppointmentForm"
        dependencies={pluginDependencies}
      >
        <Template name="main">
          <TemplatePlaceholder />
          <TemplateConnector>
            {({
              getAppointmentTitle,
              getAppointmentStartDate,
              getAppointmentEndDate,
              getAppointmentAllDay,
              getAppointmentId,

              setAppointmentTitle,
              setAppointmentStartDate,
              setAppointmentEndDate,
              setAppointmentAllDay,

              addedAppointment,
              appointmentChanges,
              editingAppointmentId,
            }, {
              stopEditAppointment,

              changeAddedAppointment,
              cancelAddedAppointment,
              commitAddedAppointment,

              changeAppointment,
              cancelChangedAppointment,
              commitChangedAppointment,
            }) => {
              const isNew = editingAppointmentId === undefined;
              const changedAppointment = {
                ...appointmentData,
                ...isNew ? addedAppointment : appointmentChanges,
              };

              return (
                <Popup
                  visible={visible}
                >
                  <Container>
                    <ScrollableArea>
                      <TitleEditor
                        readOnly={readOnly}
                        label={getMessage('titleLabel')}
                        value={getAppointmentTitle(changedAppointment)}
                        {...changeAppointment && {
                          onValueChange: changeAppointmentField(
                            isNew,
                            changeAddedAppointment,
                            changeAppointment,
                            setAppointmentTitle,
                          ),
                        }}
                      />
                      <StartDateEditor
                        readOnly={readOnly}
                        label={getMessage('startDateLabel')}
                        value={getAppointmentStartDate(changedAppointment)}
                        {...changeAppointment && {
                          onValueChange: changeAppointmentField(
                            isNew,
                            changeAddedAppointment,
                            changeAppointment,
                            setAppointmentStartDate,
                          ),
                        }}
                      />
                      <EndDateEditor
                        readOnly={readOnly}
                        label={getMessage('endDateLabel')}
                        value={getAppointmentEndDate(changedAppointment)}
                        {...changeAppointment && {
                          onValueChange: changeAppointmentField(
                            isNew,
                            changeAddedAppointment,
                            changeAppointment,
                            setAppointmentEndDate,
                          ),
                        }}
                      />
                      <AllDayEditor
                        readOnly={readOnly}
                        text={getMessage('allDayLabel')}
                        value={getAppointmentAllDay(changedAppointment)}
                        {...changeAppointment && {
                          onValueChange: changeAppointmentField(
                            isNew,
                            changeAddedAppointment,
                            changeAppointment,
                            setAppointmentAllDay,
                          ),
                        }}
                      />
                    </ScrollableArea>
                    <StaticArea>
                      <CommandButton
                        text={getMessage('cancelCommand')}
                        onExecute={() => {
                          this.toggleVisibility();
                          if (stopEditAppointment) {
                            if (isNew) {
                              cancelAddedAppointment();
                            } else {
                              stopEditAppointment();
                              cancelChangedAppointment();
                            }
                          }
                        }}
                        id={CANCEL_COMMAND_BUTTON}
                      />
                      {!readOnly && (
                        <CommandButton
                          text={getMessage('commitCommand')}
                          onExecute={() => {
                            this.toggleVisibility();
                            if (commitChangedAppointment) {
                              if (isNew) {
                                commitAddedAppointment();
                              } else {
                                commitChangedAppointment({
                                  appointmentId: getAppointmentId(changedAppointment),
                                });
                              }
                            }
                          }}
                          id={COMMIT_COMMAND_BUTTON}
                        />
                      )}
                    </StaticArea>
                  </Container>
                </Popup>
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="tooltip">
          {params => (
            <TemplateConnector>
              {({
                getAppointmentId,
              }, {
                startEditAppointment,
              }) => (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    onOpenButtonClick: () => {
                      this.openFormHandler(params.appointmentMeta.data);
                      callActionIfExists(startEditAppointment, {
                        appointmentId: getAppointmentId(params.appointmentMeta.data),
                      });
                    },
                  }}
                />
              )}
            </TemplateConnector>
          )}
        </Template>

        <Template name="appointment">
          {params => (
            <TemplateConnector>
              {({
                getAppointmentId,
              }, {
                startEditAppointment,
              }) => (
                <TemplatePlaceholder
                  params={{
                    ...params,
                    onDoubleClick: () => {
                      this.openFormHandler(params.data);
                      callActionIfExists(startEditAppointment, {
                        appointmentId: getAppointmentId(params.data),
                      });
                    },
                  }}
                />)
              }
            </TemplateConnector>
          )}
        </Template>

        <Template name="cell">
          {params => (
            <TemplateConnector>
              {(getters, {
                addAppointment,
              }) => {
                const newAppointmentData = {
                  title: undefined,
                  startDate: params.startDate,
                  endDate: params.endDate,
                  allDay: isAllDayCell(params.startDate, params.endDate),
                };
                return (
                  <TemplatePlaceholder
                    params={{
                      ...params,
                      onDoubleClick: () => {
                        this.openFormHandler(newAppointmentData);
                        callActionIfExists(addAppointment, { appointmentData: newAppointmentData });
                      },
                    }}
                  />
                );
              }}
            </TemplateConnector>
          )}
        </Template>
      </Plugin>
    );
  }
}

AppointmentForm.propTypes = {
  popupComponent: PropTypes.func.isRequired,
  startDateComponent: PropTypes.func.isRequired,
  endDateComponent: PropTypes.func.isRequired,
  titleComponent: PropTypes.func.isRequired,
  commandButtonComponent: PropTypes.func.isRequired,
  allDayComponent: PropTypes.func.isRequired,
  containerComponent: PropTypes.func.isRequired,
  scrollableAreaComponent: PropTypes.func.isRequired,
  staticAreaComponent: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  visible: PropTypes.bool,
  appointmentData: PropTypes.object,
  onVisibilityChange: PropTypes.func,
  onAppointmentDataChange: PropTypes.func,
  messages: PropTypes.shape({
    allDayLabel: PropTypes.string,
    titleLabel: PropTypes.string,
    startDateLabel: PropTypes.string,
    endDateLabel: PropTypes.string,
    commitCommand: PropTypes.string,
    cancelCommand: PropTypes.string,
  }),
};

AppointmentForm.defaultProps = {
  readOnly: false,
  visible: undefined,
  appointmentData: undefined,
  onVisibilityChange: () => undefined,
  onAppointmentDataChange: () => undefined,
  messages: {},
};

AppointmentForm.components = {
  popupComponent: 'Popup',
  containerComponent: 'Container',
  startDateComponent: 'StartDateEditor',
  endDateComponent: 'EndDateEditor',
  titleComponent: 'TitleEditor',
  allDayComponent: 'AllDayEditor',
  commandButtonComponent: 'CommandButton',
  scrollableAreaComponent: 'ScrollableArea',
  staticAreaComponent: 'StaticArea',
};
