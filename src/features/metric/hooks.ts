import { useSelector } from 'react-redux'
import { selectMetric } from './selectors'
import { MetricId } from './types'

export function useMetricValue(metricId: MetricId) {
    return useSelector(selectMetric(metricId))
}
