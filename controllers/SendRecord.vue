<!--
/*
 * 营销中心：发送记录-发送记录
 * @Author: Duyb
 * @Date: 2020-10-20 17:09:56
 * @Last Modified by: Duyb
 * @Last Modified time: 2020-11-09 12:09:02
 */
-->
<template>
  <div>
    <Form ref="form" :model="queryParam" inline :label-width="110">
      <FormItem label="活动时间：" class="form-item">
        <DatePicker
          type="datetimerange"
          v-model="queryParam.sendTime"
          format="yyyy-MM-dd HH:mm"
          :options="timeOptions"
          placeholder="请选择"
          class="input-date-range"
        ></DatePicker>
      </FormItem>
      <FormItem label="提交时间：" class="form-item">
        <DatePicker
          type="datetimerange"
          v-model="queryParam.submitTime"
          format="yyyy-MM-dd HH:mm"
          :options="timeOptions"
          placeholder="请选择"
          class="input-date-range"
        ></DatePicker>
      </FormItem>
      <FormItem label="短信状态：" class="form-item">
        <Select v-model="queryParam.status" style="width:200px">
          <Option :value="-1">全部</Option>
          <Option v-for="(v, k) in MESSAGE_STATUS" :value="+k" :key="k">{{
            v
          }}</Option>
        </Select>
      </FormItem>

      <Button type="primary" style="margin-left: 30px;" @click="_getRecords()"
        >查&nbsp;&nbsp;&nbsp;询</Button
      >
    </Form>

    <Table
      :columns="columns"
      :data="list"
      @on-sort-change="_handleSort"
      class="table-record"
    />
    <Page
      :total="total"
      :current="page"
      show-elevator
      show-sizer
      show-total
      placement="top"
      @on-change="_getRecords"
      @on-page-size-change="_pageSize"
    >
    </Page>
  </div>
</template>

<script>
import {
  Form,
  FormItem,
  DatePicker,
  Select,
  Option,
  Button,
  Table,
  Page,
  Modal,
} from 'view-design';
import API from '@/assets/js/api';
import Utils from '@/assets/js/utils';
import {
  MESSAGE_STATUS,
  MESSAGE_STATUS_TEXT,
  // 可取消
  CANCELABLE_MESSAGE_STATUS_LIST,
  // 可删除
  DELETABLE_MESSAGE_STATUS_LIST,
} from '@/assets/js/utils/global';

export default {
  name: 'MarketingSendRecord',
  components: {
    Form,
    FormItem,
    DatePicker,
    Select,
    Option,
    Button,
    Table,
    Page,
  },
  data() {
    return {
      MESSAGE_STATUS,
      queryParam: {
        sendTime: ['', ''],
        submitTime: ['', ''],
        status: -1,
        sortKey: 'submit_time',
        sort: 'desc',
      },
      timeOptions: {
        // 禁止选择今天之后的时间
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        },
      },
      page: 1,
      pageSize: 10,
      total: 0,
      columns: [
        {
          title: '活动名称',
          key: 'activityName',
        },
        {
          title: '活动时间',
          width: 122,
          // [远程排序: @on-sort-change ](https://www.iviewui.com/components/table#PX)
          sortable: 'custom',
          key: 'sendTime',
          render: (h, params) => {
            const sendTime = params.row.sendTime;
            const text = Utils.dateFormat(sendTime);
            return h('span', text);
          },
        },
        {
          title: '短信内容',
          width: 300,
          key: 'message',
        },
        {
          title: '客户人数',
          key: 'total',
        },
        {
          title: '短信量',
          key: 'fee',
        },
        {
          title: '短信状态',
          render: (h, params) => {
            const text = MESSAGE_STATUS[params.row.status] || '--';
            return h('span', text);
          },
        },
        {
          title: '提交时间',
          width: 122,
          sortable: 'custom',
          key: 'submitTime',
          render: (h, params) => {
            const submitTime = params.row.submitTime;
            const text = Utils.dateFormat(submitTime);
            return h('span', text);
          },
        },
        {
          title: '促成订单',
          key: 'trades',
        },
        {
          title: '销售额 / 元',
          render: (h, params) => {
            const amount = params.row.amount;
            const amountYuan = Number.parseFloat((amount / 100).toFixed(2));
            const text = Utils.numberThousandsSeparator(amountYuan);
            return h('span', text === '--' ? text : `¥${text}`);
          },
        },
        {
          title: 'ROI / %',
          key: 'roiValue',
          render: (h, params) => {
            const roi = params.row.roiValue;
            const text = roi ? Number.parseFloat((roi * 100).toFixed(2)) : '--';
            return h('span', text);
          },
        },
        {
          title: '操作',
          render: (h, params) => {
            const data = params.row;
            const id = data.id;
            const status = data.status;
            const _this = this;

            const renderArr = [
              h(
                'a',
                {
                  attrs: {
                    herf: 'javascript: void(0);',
                  },
                  on: {
                    click() {
                      _this.$router.push({
                        name: 'MarketingEffect',
                        params: {
                          id,
                        },
                      });
                    },
                  },
                },
                '营销效果'
              ),
            ];

            // 取消
            if (CANCELABLE_MESSAGE_STATUS_LIST.includes(status)) {
              renderArr.push(
                h(
                  'a',
                  {
                    attrs: {
                      herf: 'javascript: void(0);',
                      class: 'td-btn',
                    },
                    on: {
                      click() {
                        _this._cancel(id);
                      },
                    },
                  },
                  '取消'
                )
              );
            }

            // 删除
            if (DELETABLE_MESSAGE_STATUS_LIST.includes(status)) {
              renderArr.push(
                h(
                  'a',
                  {
                    attrs: {
                      herf: 'javascript: void(0);',
                      class: 'td-btn',
                    },
                    on: {
                      click() {
                        _this._delete(id);
                      },
                    },
                  },
                  '删除'
                )
              );
            }

            return renderArr;
          },
        },
      ],
      list: [],
    };
  },
  created() {
    this._getRecords();
  },
  methods: {
    _getRecords(page = 1) {
      this.page = page;
      const param = {
        page,
        size: this.pageSize,
        ...this._formatParam(),
      };
      API.getMarketingSendRecords(param)
        .then((data) => {
          this.list = data.list;
          this.total = data.total;
        })
        .catch((err) => {
          this.$catchError(err);
        });
    },
    _pageSize(pageSize) {
      this.pageSize = pageSize;
      this._getRecords();
    },
    _formatParam() {
      const param = {};
      // 时间参数表 k
      const dateParamList = ['sendTime', 'submitTime'];

      for (let k in this.queryParam) {
        if (Object.prototype.hasOwnProperty.call(this.queryParam, k)) {
          const v = this.queryParam[k];
          const isDate = dateParamList.includes(k);

          if (Array.isArray(v)) {
            const v0 = isDate ? new Date(v[0]).getTime() : v[0];
            const v1 = isDate ? new Date(v[1]).getTime() : v[1];

            if (v0) {
              param[`min${k.charAt(0).toUpperCase()}${k.substr(1)}`] = v0;
            }
            if (v1) {
              param[`max${k.charAt(0).toUpperCase()}${k.substr(1)}`] = v1;
            }
          } else if (v !== undefined && v !== null && v !== '' && v !== -1) {
            param[k] = isDate ? new Date(v).getTime() : v;
          }
        }
      }

      console.log('_formatParam param :', param);

      return param;
    },
    /**
     * @param {Object} options
     * @param {Object} options.column
     * @param {String} options.key - Table[columns].key
     * @param {String} options.order - asc | desc
     */
    _handleSort(options) {
      const KEY_MAP = {
        submitTime: 'submit_time',
        sendTime: 'send_time',
      };
      this.queryParam.sortKey = KEY_MAP[options.key];
      this.queryParam.sort = options.order;
      this._getRecords();
    },

    // 营销效果
    _showEffect(data) {
      this.$emit('on-show-effect', data);
    },

    // 取消
    _cancel(id) {
      Modal.confirm({
        title: '取消发送',
        content: '<p>您是否取消当前短信发送？</p>',
        loading: true,
        onOk: () => {
          API.cancelMarketing({ id })
            .then(() => {
              this.list.filter((item) => item.id === id)[0].status =
                MESSAGE_STATUS_TEXT['已取消'];
              Modal.remove();
              this.$Message.success('取消成功');
            })
            .catch((err) => {
              this.$catchError(err);
            });
        },
      });
    },
    // 删除
    _delete(id) {
      Modal.confirm({
        title: '删除记录',
        content: '<p>确认删除当前发送记录吗？</p>',
        loading: true,
        onOk: () => {
          API.deleteMarketingRecord({ id })
            .then(() => {
              this.list = this.list.filter((item) => item.id !== id);
              this.total -= 1;
              Modal.remove();
              this.$Message.success('删除成功');
            })
            .catch((err) => {
              this.$catchError(err);
            });
        },
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
.input-date-range
  width 275px
.table-record
  & >>> .td-btn
    margin-left 6px
  & >>> .ivu-table-cell
    padding-left 6px
    padding-right 6px
</style>
