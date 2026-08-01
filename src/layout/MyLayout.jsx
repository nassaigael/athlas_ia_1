import {Layout} from 'react-admin';
import MyAppBar from './MyAppBar';

export default function MyLayout(props) {

    return <Layout {...props} appBar={MyAppBar} children={props.children}/>;
}
