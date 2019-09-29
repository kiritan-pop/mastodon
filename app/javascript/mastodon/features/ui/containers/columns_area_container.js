import { connect } from 'react-redux';
import ColumnsArea from '../components/columns_area';
import {
  changeCompose,
  submitCompose,
} from '../../../actions/compose';

const mapStateToProps = state => ({
  columns: state.getIn(['settings', 'columns']),
  isModalOpen: !!state.get('modal').modalType,
  text: state.getIn(['compose', 'text']),
  isSubmitting: state.getIn(['compose', 'is_submitting']),
});

const mapDispatchToProps = (dispatch) => ({
  onChange(text) {
    dispatch(changeCompose(text));
  },
  onSubmit(router) {
    dispatch(submitCompose(router, "public"));
  },
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ColumnsArea);
