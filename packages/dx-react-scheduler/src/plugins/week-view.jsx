import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  Template,
  Plugin,
  Getter,
  TemplateConnector,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import {
  computed,
  viewCellsData as viewCellsDataCore,
  calculateRectByDateIntervals,
  calculateWeekDateIntervals,
  getAppointmentStyle,
  getVerticalRectByDates,
  startViewDate as startViewDateCore,
  endViewDate as endViewDateCore,
  availableViews as availableViewsCore,
  VERTICAL_TYPE,
} from '@devexpress/dx-scheduler-core';

const DAYS_IN_WEEK = 7;
const TYPE = 'week';

export class WeekView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      timeTableRef: null,
    };

    this.timeTableRef = this.timeTableRef.bind(this);

    this.sidebarPlaceholder = () => <TemplatePlaceholder name="sidebar" />;
    this.dayScalePlaceholder = () => <TemplatePlaceholder name="navbar" />;
    this.timeTablePlaceholder = () => <TemplatePlaceholder name="main" />;
    this.dayScaleEmptyCellPlaceholder = () => <TemplatePlaceholder name="dayScaleEmptyCell" />;
    this.appointmentPlaceholder = params => <TemplatePlaceholder name="appointment" params={params} />;
    this.cellPlaceholder = params => <TemplatePlaceholder name="cell" params={params} />;

    const {
      name: viewName,
      firstDayOfWeek,
      startDayHour,
      endDayHour,
      cellDuration,
      excludedDays,
      intervalCount,
    } = this.props;

    this.endViewDateBaseComputed = ({
      viewCellsData,
    }) => endViewDateCore(viewCellsData);
    this.startViewDateBaseComputed = ({
      viewCellsData,
    }) => startViewDateCore(viewCellsData);
    this.viewCellsDataBaseComputed = ({
      currentView, currentDate,
    }) => viewCellsDataCore(
      currentView.type, currentDate, firstDayOfWeek,
      intervalCount, intervalCount * DAYS_IN_WEEK, excludedDays,
      startDayHour, endDayHour, cellDuration,
    );

    this.currentViewComputed = ({ currentView }) => (
      currentView && currentView.name !== viewName
        ? currentView
        : { name: viewName, type: TYPE }
    );
    this.availableViewsComputed = ({ availableViews }) => availableViewsCore(
      availableViews, viewName,
    );
    this.intervalCountComputed = getters => computed(
      getters, viewName, () => intervalCount, getters.intervalCount,
    );
    this.firstDayOfWeekComputed = getters => computed(
      getters, viewName, () => firstDayOfWeek, getters.firstDayOfWeek,
    );
    this.excludedDaysComputed = getters => computed(
      getters, viewName, () => excludedDays, getters.excludedDays,
    );
    this.startViewDateComputed = getters => computed(
      getters, viewName, this.startViewDateBaseComputed, getters.startViewDate,
    );
    this.endViewDateComputed = getters => computed(
      getters, viewName, this.endViewDateBaseComputed, getters.endViewDate,
    );
    this.viewCellsData = getters => computed(
      getters, viewName, this.viewCellsDataBaseComputed, getters.viewCellsData,
    );
  }

  timeTableRef(timeTableRef) {
    this.setState({ timeTableRef });
  }

  render() {
    const {
      layoutComponent: ViewLayout,
      dayScaleEmptyCellComponent: DayScaleEmptyCell,
      timeScaleLayoutComponent: TimeScale,
      timeScaleRowComponent: TimeScaleRow,
      timeScaleCellComponent: TimeScaleCell,
      dayScaleLayoutComponent: DayScale,
      dayScaleCellComponent: DayScaleCell,
      dayScaleRowComponent: DayScaleRow,
      timeTableLayoutComponent: TimeTable,
      timeTableRowComponent: TimeTableRow,
      timeTableCellComponent: TimeTableCell,
      cellDuration,
      excludedDays,
      name: viewName,
      containerComponent: Container,
    } = this.props;
    const { timeTableRef } = this.state;

    return (
      <Plugin
        name="WeekView"
      >
        <Getter name="availableViews" computed={this.availableViewsComputed} />
        <Getter name="currentView" computed={this.currentViewComputed} />
        <Getter name="intervalCount" computed={this.intervalCountComputed} />
        <Getter name="firstDayOfWeek" computed={this.firstDayOfWeekComputed} />
        <Getter name="excludedDays" computed={this.excludedDaysComputed} />
        <Getter name="viewCellsData" computed={this.viewCellsData} />
        <Getter name="startViewDate" computed={this.startViewDateComputed} />
        <Getter name="endViewDate" computed={this.endViewDateComputed} />

        <Template name="body">
          <TemplateConnector>
            {({ currentView }) => {
              if (currentView.name !== viewName) return <TemplatePlaceholder />;
              return (
                <ViewLayout
                  dayScaleComponent={this.dayScalePlaceholder}
                  dayScaleEmptyCellComponent={this.dayScaleEmptyCellPlaceholder}
                  timeTableComponent={this.timeTablePlaceholder}
                  timeScaleComponent={this.sidebarPlaceholder}
                />
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="navbar">
          <TemplateConnector>
            {({ currentView, viewCellsData }) => {
              if (currentView.name !== viewName) return <TemplatePlaceholder />;
              return (
                <DayScale
                  cellComponent={DayScaleCell}
                  rowComponent={DayScaleRow}
                  cellsData={viewCellsData}
                />
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="dayScaleEmptyCell">
          <TemplateConnector>
            {({ currentView }) => {
              if (currentView.name !== viewName) return <TemplatePlaceholder />;
              return (
                <DayScaleEmptyCell />
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="sidebar">
          <TemplateConnector>
            {({ currentView, viewCellsData }) => {
              if (currentView.name !== viewName) return <TemplatePlaceholder />;
              return (
                <TimeScale
                  rowComponent={TimeScaleRow}
                  cellComponent={TimeScaleCell}
                  cellsData={viewCellsData}
                />
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="main">
          <TemplateConnector>
            {({
              appointments, startViewDate,
              endViewDate, currentView, viewCellsData,
            }) => {
              if (currentView.name !== viewName) return <TemplatePlaceholder />;
              const intervals = calculateWeekDateIntervals(
                appointments, startViewDate, endViewDate, excludedDays,
              );
              const rects = timeTableRef ? calculateRectByDateIntervals(
                {
                  growDirection: VERTICAL_TYPE,
                  multiline: false,
                },
                intervals,
                getVerticalRectByDates,
                {
                  startViewDate,
                  endViewDate,
                  viewCellsData,
                  cellDuration,
                  cellElements: timeTableRef.querySelectorAll('td'),
                },
              ) : [];

              const { appointmentPlaceholder: AppointmentPlaceholder } = this;
              return (
                <React.Fragment>
                  <TimeTable
                    rowComponent={TimeTableRow}
                    cellComponent={this.cellPlaceholder}
                    tableRef={this.timeTableRef}
                    cellsData={viewCellsData}
                  />
                  <Container>
                    {rects.map(({
                      dataItem, type, ...geometry
                    }, index) => (
                      <AppointmentPlaceholder
                        key={index.toString()}
                        type={type}
                        data={dataItem}
                        style={getAppointmentStyle(geometry)}
                      />
                    ))}
                  </Container>
                </React.Fragment>
              );
            }}
          </TemplateConnector>
        </Template>

        <Template name="cell">
          {params => (
            <TemplateConnector>
              {({ currentView }) => {
                if (currentView.name !== viewName) return <TemplatePlaceholder params={params} />;
                return (
                  <TimeTableCell {...params} />
                );
              }}
            </TemplateConnector>
          )}
        </Template>
      </Plugin>
    );
  }
}

WeekView.propTypes = {
  layoutComponent: PropTypes.func.isRequired,
  dayScaleEmptyCellComponent: PropTypes.func.isRequired,
  timeScaleLayoutComponent: PropTypes.func.isRequired,
  timeScaleRowComponent: PropTypes.func.isRequired,
  timeScaleCellComponent: PropTypes.func.isRequired,
  dayScaleLayoutComponent: PropTypes.func.isRequired,
  dayScaleCellComponent: PropTypes.func.isRequired,
  dayScaleRowComponent: PropTypes.func.isRequired,
  timeTableLayoutComponent: PropTypes.func.isRequired,
  timeTableRowComponent: PropTypes.func.isRequired,
  timeTableCellComponent: PropTypes.func.isRequired,
  containerComponent: PropTypes.func.isRequired,
  startDayHour: PropTypes.number,
  endDayHour: PropTypes.number,
  cellDuration: PropTypes.number,
  intervalCount: PropTypes.number,
  firstDayOfWeek: PropTypes.number,
  excludedDays: PropTypes.array,
  name: PropTypes.string,
};

WeekView.defaultProps = {
  startDayHour: 0,
  endDayHour: 24,
  cellDuration: 30,
  intervalCount: 1,
  firstDayOfWeek: 0,
  excludedDays: [],
  name: 'Week',
};

WeekView.components = {
  layoutComponent: 'Layout',
  containerComponent: 'Container',
  dayScaleEmptyCellComponent: 'DayScaleEmptyCell',
  timeScaleLayoutComponent: 'TimeScaleLayout',
  timeScaleCellComponent: 'TimeScaleCell',
  timeScaleRowComponent: 'TimeScaleRow',
  dayScaleLayoutComponent: 'DayScaleLayout',
  dayScaleCellComponent: 'DayScaleCell',
  dayScaleRowComponent: 'DayScaleRow',
  timeTableLayoutComponent: 'TimeTableLayout',
  timeTableCellComponent: 'TimeTableCell',
  timeTableRowComponent: 'TimeTableRow',
};
