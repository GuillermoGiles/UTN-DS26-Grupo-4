import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { turnoSchema, type TurnoValidado } from '../validations/turnoSchema';
import { FiCalendar, FiClock, FiUser, FiTool, FiCheckCircle } from 'react-icons/fi';

export function AltaTurno() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TurnoValidado>({
        resolver: zodResolver(turnoSchema),
        defaultValues: {
            fecha: '',
            hora: '',
            cliente: '',
            tipoServicio: ''
        }
    });

    const onSubmit = (data: TurnoValidado) => {
        console.log("Nuevo turno registrado exitosamente: ", data);
        // Acá a futuro iría la conexión al backend. 
        // Por ahora, cumplimos con el TP redirigiendo al home/panel
        navigate('/');
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-md-center">
                <Col md={8} lg={6}>
                    <div className="saas-card p-4 p-md-5">
                        <div className="text-center mb-5">
                            <h2 className="mb-2">Reservar Turno</h2>
                            <p className="text-muted">Agendá un nuevo ingreso para el lavadero o lubricentro</p>
                        </div>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="fecha">
                                        <Form.Label className="small fw-bold text-muted">FECHA</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="date" 
                                                isInvalid={!!errors.fecha}
                                                {...register("fecha")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiCalendar className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.fecha?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="hora">
                                        <Form.Label className="small fw-bold text-muted">HORA</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="time" 
                                                isInvalid={!!errors.hora}
                                                {...register("hora")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiClock className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.hora?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4" controlId="cliente">
                                <Form.Label className="small fw-bold text-muted">CLIENTE / PATENTE</Form.Label>
                                <div className="position-relative">
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Ej: Juan Pérez - AB123CD"
                                        isInvalid={!!errors.cliente}
                                        {...register("cliente")} 
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <FiUser className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.cliente?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-5" controlId="tipoServicio">
                                <Form.Label className="small fw-bold text-muted">SERVICIO SOLICITADO</Form.Label>
                                <div className="position-relative">
                                    <Form.Select 
                                        isInvalid={!!errors.tipoServicio}
                                        {...register("tipoServicio")}
                                        style={{ paddingLeft: '2.5rem' }}
                                    >
                                        <option value="">Seleccione una opción...</option>
                                        <option value="lavado_basico">Lavado Básico</option>
                                        <option value="lavado_premium">Lavado Completo Premium</option>
                                        <option value="cambio_aceite">Cambio de Aceite y Filtros</option>
                                        <option value="alineacion">Alineación y Balanceo</option>
                                    </Form.Select>
                                    <FiTool className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.tipoServicio?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <button type="submit" className="w-100 btn-primary-custom d-flex justify-content-center align-items-center gap-2">
                                <FiCheckCircle size={20} /> Confirmar Turno
                            </button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}