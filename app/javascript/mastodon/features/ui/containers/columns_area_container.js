import { connect } from 'react-redux';
import ColumnsArea from '../components/columns_area';
import {
  changeCompose,
  submitCompose,
  syncCompose,
} from '../../../actions/compose_kiri';

const mapStateToProps = state => ({
  columns: state.getIn(['settings', 'columns']),
  isModalOpen: !!state.get('modal').modalType,
  text: state.getIn(['compose_kiri', 'text']),
  isSubmitting: state.getIn(['compose_kiri', 'is_submitting']),
});

const mapDispatchToProps = (dispatch) => ({
  onChange(text) {
    dispatch(changeCompose(text));
  },
  onSubmit(router) {
    dispatch(submitCompose(router, "public"));
  },
  onSync(text) {
    dispatch(syncCompose(text));
  },
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ColumnsArea);
