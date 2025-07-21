import { connect } from 'react-redux';

import {
  changeCompose,
  submitCompose,
  syncCompose,
} from '../../../actions/compose_kiri';
import ColumnsArea from '../components/columns_area';

const mapStateToProps = state => ({
  columns: state.getIn(['settings', 'columns']),
  isModalOpen: !!state.get('modal').modalType,
  text: state.getIn(['compose_kiri', 'text']),
  isSubmitting: state.getIn(['compose_kiri', 'is_submitting']),
  privacy: state.getIn(['compose', 'privacy']),
  localOnly: state.getIn(['compose', 'local_only'], false),
});

const mapDispatchToProps = (dispatch) => ({
  onChange(text) {
    dispatch(changeCompose(text));
  },
  onSubmit() {
    dispatch(submitCompose());
  },
  onSync(text) {
    dispatch(syncCompose(text));
  },
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ColumnsArea);
