import {
    NumberWidgetDefine,
    SelectWeightDefine,
    TextWidgetDefine,
    Theme,
} from '../../types'
import SelectionWidget from './widgets/SelectionWidget'
import TextWidget from './widgets/TextWidget'
import NumberWidget from './widgets/NumberWidget'

const theme: Theme = {
    witgets: {
        // TODO: 类型报错
        SelectionWidget: SelectionWidget as SelectWeightDefine,
        TextWidget: TextWidget as TextWidgetDefine,
        NumberWidget: NumberWidget as NumberWidgetDefine,
    },
}

export default theme
