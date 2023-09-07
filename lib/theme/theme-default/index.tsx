import { SelectWeightDefine, Theme } from 'lib/types'
import SelectionWidget from './widgets/SelectionWidget'

const theme: Theme = {
    witgets: {
        // TODO: 类型报错
        SelectionWidget: SelectionWidget as SelectWeightDefine,
    },
}

export default theme
