import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Sao_Paulo");

export { dayjs };
